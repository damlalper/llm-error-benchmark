"""
Scoring Functions for LLM Evaluation
"""

from typing import Dict, Any
from config import (
    WORD_COUNT_OPTIMAL, WORD_COUNT_ACCEPTABLE, WORD_COUNT_POOR,
    RESPONSE_TIME_EXCELLENT, RESPONSE_TIME_GOOD, RESPONSE_TIME_ACCEPTABLE
)


class Scorer:
    """Score LLM responses based on various criteria"""

    @staticmethod
    def score_technical_accuracy(features: Dict[str, Any]) -> float:
        """
        Score technical accuracy (0-25 points)

        Criteria:
        - Error keyword mentioned: +5
        - Cause explanation: +5
        - Technical terms used: +7 (max)
        - Code examples: +8
        """
        score = 0.0

        # Has error-related keywords
        if features['has_error_keyword']:
            score += 5

        # Explains the cause
        if features['has_cause_keyword']:
            score += 5

        # Technical term density
        tech_score = min(7, features['technical_terms'] // 3)
        score += tech_score

        # Has code examples
        if features['code_blocks'] > 0:
            score += 8

        return min(25.0, score)

    @staticmethod
    def score_solution_quality(features: Dict[str, Any]) -> float:
        """
        Score solution quality (0-25 points)

        Criteria:
        - Solution keyword: +5
        - Step-by-step instructions: +8
        - Code examples: +8
        - Alternative solutions: +4
        """
        score = 0.0

        # Mentions solution
        if features['has_solution_keyword']:
            score += 5

        # Has structured steps
        if features['numbered_lists'] > 0 or features['bullet_points'] > 2:
            score += 8

        # Code examples
        if features['code_blocks'] > 0:
            score += 8

        # Alternative approaches
        if features['has_alternative_keyword']:
            score += 4

        return min(25.0, score)

    @staticmethod
    def score_clarity(features: Dict[str, Any]) -> float:
        """
        Score clarity and structure (0-20 points)

        Criteria:
        - Headings: +5
        - Lists/bullets: +5
        - Multiple paragraphs: +5
        - Visual markers: +5
        """
        score = 0.0

        # Has headings
        if features['headings'] > 0:
            score += 5

        # Has lists
        if features['bullet_points'] > 0 or features['numbered_lists'] > 0:
            score += 5

        # Multiple paragraphs (good structure)
        if features['paragraph_count'] >= 3:
            score += 5

        # Visual markers for readability
        if features['has_visual_markers']:
            score += 5

        return min(20.0, score)

    @staticmethod
    def score_conciseness(features: Dict[str, Any]) -> float:
        """
        Score conciseness (0-10 points)

        Optimal: 300-800 words
        Acceptable: 200-1000 words
        Poor: <100 or >1500 words
        """
        wc = features['word_count']

        if WORD_COUNT_OPTIMAL[0] <= wc <= WORD_COUNT_OPTIMAL[1]:
            return 10.0
        elif WORD_COUNT_ACCEPTABLE[0] <= wc <= WORD_COUNT_ACCEPTABLE[1]:
            return 7.0
        elif WORD_COUNT_POOR[0] <= wc <= WORD_COUNT_POOR[1]:
            return 4.0
        else:
            return 1.0

    @staticmethod
    def score_response_time(time_ms: float) -> float:
        """
        Score response time (0-10 points)

        Excellent: <5s
        Good: 5-15s
        Acceptable: 15-30s
        Poor: >30s
        """
        if time_ms is None:
            return 0.0

        if time_ms < RESPONSE_TIME_EXCELLENT:
            return 10.0
        elif time_ms < RESPONSE_TIME_GOOD:
            return 7.0
        elif time_ms < RESPONSE_TIME_ACCEPTABLE:
            return 4.0
        else:
            return 1.0

    @staticmethod
    def score_reliability(is_error: bool) -> float:
        """
        Score reliability (0-10 points)

        Success: 10
        Error: 0
        """
        return 0.0 if is_error else 10.0

    @staticmethod
    def calculate_weighted_score(scores: Dict[str, float], weights: Dict[str, float]) -> float:
        """
        Calculate weighted total score

        Args:
            scores: Individual criterion scores (already 0-25, 0-20, 0-10 scales)
            weights: Weights for each criterion (sum to 1.0)

        Returns:
            Weighted total score (0-100)
        """
        # Each score is already on its own scale (25, 25, 20, 10, 10, 10)
        # We need to normalize and apply weights
        total = 0.0

        # Normalize each score to 0-100 first, then apply weight
        total += (scores.get('technical_accuracy', 0) / 25.0) * 100 * weights['technical_accuracy']
        total += (scores.get('solution_quality', 0) / 25.0) * 100 * weights['solution_quality']
        total += (scores.get('clarity', 0) / 20.0) * 100 * weights['clarity']
        total += (scores.get('conciseness', 0) / 10.0) * 100 * weights['conciseness']
        total += (scores.get('speed', 0) / 10.0) * 100 * weights['speed']
        total += (scores.get('reliability', 0) / 10.0) * 100 * weights['reliability']

        return total

    @staticmethod
    def score_response(features: Dict[str, Any], response_time: float, is_error: bool, weights: Dict[str, float]) -> Dict[str, float]:
        """
        Score a single response across all criteria

        Args:
            features: Extracted features
            response_time: Response time in ms
            is_error: Whether response is an error
            weights: Scoring weights

        Returns:
            Dictionary with individual scores and total
        """
        scores = {
            'technical_accuracy': Scorer.score_technical_accuracy(features),
            'solution_quality': Scorer.score_solution_quality(features),
            'clarity': Scorer.score_clarity(features),
            'conciseness': Scorer.score_conciseness(features),
            'speed': Scorer.score_response_time(response_time),
            'reliability': Scorer.score_reliability(is_error)
        }

        scores['total'] = Scorer.calculate_weighted_score(scores, weights)

        return scores
