"""
Feature Extraction from LLM Responses
"""

import re
from typing import Dict, Any
from config import (
    TECHNICAL_KEYWORDS, SOLUTION_KEYWORDS, CAUSE_KEYWORDS,
    ALTERNATIVE_KEYWORDS
)


class FeatureExtractor:
    """Extract features from LLM response text"""

    @staticmethod
    def extract(text: str) -> Dict[str, Any]:
        """
        Extract all features from response text

        Args:
            text: LLM response text

        Returns:
            Dictionary of features
        """
        if not text or text.startswith('Error:'):
            return FeatureExtractor._empty_features()

        return {
            'word_count': FeatureExtractor._count_words(text),
            'code_blocks': FeatureExtractor._count_code_blocks(text),
            'headings': FeatureExtractor._count_headings(text),
            'bullet_points': FeatureExtractor._count_bullet_points(text),
            'numbered_lists': FeatureExtractor._count_numbered_lists(text),
            'technical_terms': FeatureExtractor._count_technical_terms(text),
            'has_error_keyword': FeatureExtractor._has_keywords(text, ['hata', 'error', 'kod']),
            'has_solution_keyword': FeatureExtractor._has_keywords(text, SOLUTION_KEYWORDS),
            'has_cause_keyword': FeatureExtractor._has_keywords(text, CAUSE_KEYWORDS),
            'has_alternative_keyword': FeatureExtractor._has_keywords(text, ALTERNATIVE_KEYWORDS),
            'paragraph_count': FeatureExtractor._count_paragraphs(text),
            'has_visual_markers': FeatureExtractor._has_visual_markers(text),
            'sentence_count': FeatureExtractor._count_sentences(text),
            'avg_sentence_length': FeatureExtractor._avg_sentence_length(text),
        }

    @staticmethod
    def _empty_features() -> Dict[str, Any]:
        """Return empty feature dict for failed responses"""
        return {
            'word_count': 0,
            'code_blocks': 0,
            'headings': 0,
            'bullet_points': 0,
            'numbered_lists': 0,
            'technical_terms': 0,
            'has_error_keyword': False,
            'has_solution_keyword': False,
            'has_cause_keyword': False,
            'has_alternative_keyword': False,
            'paragraph_count': 0,
            'has_visual_markers': False,
            'sentence_count': 0,
            'avg_sentence_length': 0,
        }

    @staticmethod
    def _count_words(text: str) -> int:
        """Count words in text"""
        return len(text.split())

    @staticmethod
    def _count_code_blocks(text: str) -> int:
        """Count code blocks (```)"""
        return text.count('```') // 2

    @staticmethod
    def _count_headings(text: str) -> int:
        """Count markdown headings"""
        return len(re.findall(r'^#+\s', text, re.MULTILINE))

    @staticmethod
    def _count_bullet_points(text: str) -> int:
        """Count bullet points"""
        return len(re.findall(r'^\s*[-*•]\s', text, re.MULTILINE))

    @staticmethod
    def _count_numbered_lists(text: str) -> int:
        """Count numbered lists"""
        return len(re.findall(r'^\s*\d+[\.)]\s', text, re.MULTILINE))

    @staticmethod
    def _count_technical_terms(text: str) -> int:
        """Count technical keywords"""
        text_lower = text.lower()
        count = 0
        for keyword in TECHNICAL_KEYWORDS:
            count += text_lower.count(keyword.lower())
        return count

    @staticmethod
    def _has_keywords(text: str, keywords: list) -> bool:
        """Check if text contains any of the keywords"""
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in keywords)

    @staticmethod
    def _count_paragraphs(text: str) -> int:
        """Count paragraphs"""
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        return len(paragraphs)

    @staticmethod
    def _has_visual_markers(text: str) -> bool:
        """Check for emoji/visual markers"""
        markers = ['✅', '❌', '🔍', '⚠️', '💡', '🚀', '📝', '🎯', '⏱️', '💾']
        return any(marker in text for marker in markers)

    @staticmethod
    def _count_sentences(text: str) -> int:
        """Count sentences"""
        # Simple sentence detection
        sentences = re.split(r'[.!?]+', text)
        return len([s for s in sentences if s.strip()])

    @staticmethod
    def _avg_sentence_length(text: str) -> float:
        """Calculate average sentence length"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            return 0
        total_words = sum(len(s.split()) for s in sentences)
        return total_words / len(sentences)
