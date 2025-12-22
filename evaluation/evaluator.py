"""
Main LLM Evaluation Engine
"""

import psycopg2
from typing import Dict, List, Any
from feature_extractor import FeatureExtractor
from scorer import Scorer
from config import DB_CONFIG, LLM_NAMES, WEIGHTS


class LLMEvaluator:
    """Evaluate and compare LLM performances"""

    def __init__(self):
        self.conn = None
        self.extractor = FeatureExtractor()
        self.scorer = Scorer()

    def connect_db(self):
        """Connect to PostgreSQL database"""
        self.conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Database connected")

    def close_db(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("✅ Database connection closed")

    def fetch_all_responses(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Fetch all LLM responses from database

        Returns:
            Dictionary mapping LLM names to list of response objects
        """
        cursor = self.conn.cursor()

        query = """
        SELECT
            id,
            error_category,
            error_code,
            error_message,
            groq_response,
            mistral_response,
            cohere_response,
            openrouter_response,
            openrouter_hermes_response,
            groq_response_time,
            mistral_response_time,
            cohere_response_time,
            openrouter_response_time,
            openrouter_hermes_response_time
        FROM llm_error_analysis
        ORDER BY id
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()

        # Organize by LLM
        llm_responses = {llm: [] for llm in LLM_NAMES}

        for row in rows:
            (id, error_category, error_code, error_message,
             groq_resp, mistral_resp, cohere_resp,
             openrouter_resp, openrouter_hermes_resp,
             groq_time, mistral_time, cohere_time,
             openrouter_time, openrouter_hermes_time) = row

            # Groq
            llm_responses['groq'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': groq_resp,
                'response_time': groq_time,
                'is_error': groq_resp.startswith('Error:') if groq_resp else True
            })

            # Mistral
            llm_responses['mistral'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': mistral_resp,
                'response_time': mistral_time,
                'is_error': mistral_resp.startswith('Error:') if mistral_resp else True
            })

            # Cohere
            llm_responses['cohere'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': cohere_resp,
                'response_time': cohere_time,
                'is_error': cohere_resp.startswith('Error:') if cohere_resp else True
            })

            # OpenRouter Llama
            llm_responses['openrouter_llama'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': openrouter_resp,
                'response_time': openrouter_time,
                'is_error': openrouter_resp.startswith('Error:') if openrouter_resp else True
            })

            # OpenRouter Mistral (same as Llama in our schema)
            llm_responses['openrouter_mistral'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': openrouter_resp,  # Same column
                'response_time': openrouter_time,
                'is_error': openrouter_resp.startswith('Error:') if openrouter_resp else True
            })

            # OpenRouter Hermes
            llm_responses['openrouter_hermes'].append({
                'id': id,
                'error_category': error_category,
                'error_code': error_code,
                'text': openrouter_hermes_resp,
                'response_time': openrouter_hermes_time,
                'is_error': openrouter_hermes_resp.startswith('Error:') if openrouter_hermes_resp else True
            })

        print(f"📊 Fetched {len(rows)} responses for {len(LLM_NAMES)} LLMs")
        return llm_responses

    def evaluate_all_llms(self) -> Dict[str, Any]:
        """
        Evaluate all LLMs and return comprehensive results

        Returns:
            Dictionary with scores, rankings, best/worst LLMs
        """
        print("\n🔍 Starting LLM evaluation...\n")

        # Fetch data
        llm_responses = self.fetch_all_responses()

        # Calculate scores for each LLM
        llm_scores = {}
        llm_details = {}

        for llm_name, responses in llm_responses.items():
            print(f"⚙️  Evaluating {llm_name}...")

            total_score = 0.0
            valid_count = 0
            criterion_totals = {
                'technical_accuracy': 0,
                'solution_quality': 0,
                'clarity': 0,
                'conciseness': 0,
                'speed': 0,
                'reliability': 0
            }

            for response_obj in responses:
                # Extract features
                features = self.extractor.extract(response_obj['text'])

                # Score response
                scores = self.scorer.score_response(
                    features,
                    response_obj['response_time'],
                    response_obj['is_error'],
                    WEIGHTS
                )

                total_score += scores['total']
                valid_count += 1

                # Accumulate criterion scores
                for criterion in criterion_totals.keys():
                    criterion_totals[criterion] += scores[criterion]

            # Calculate averages
            avg_score = total_score / valid_count if valid_count > 0 else 0

            avg_criterion_scores = {
                criterion: total / valid_count if valid_count > 0 else 0
                for criterion, total in criterion_totals.items()
            }

            llm_scores[llm_name] = avg_score
            llm_details[llm_name] = {
                'average_score': avg_score,
                'total_responses': len(responses),
                'valid_responses': valid_count,
                'criterion_scores': avg_criterion_scores
            }

            print(f"   ✅ {llm_name}: {avg_score:.2f}/100")

        # Ranking
        ranked_llms = sorted(llm_scores.items(), key=lambda x: x[1], reverse=True)

        best_llm = ranked_llms[0][0]
        worst_llm = ranked_llms[-1][0]

        print(f"\n🏆 Best LLM: {best_llm} ({llm_scores[best_llm]:.2f})")
        print(f"💔 Worst LLM: {worst_llm} ({llm_scores[worst_llm]:.2f})\n")

        return {
            'scores': llm_scores,
            'details': llm_details,
            'ranking': ranked_llms,
            'best_llm': best_llm,
            'worst_llm': worst_llm
        }

    def run(self) -> Dict[str, Any]:
        """
        Run complete evaluation pipeline

        Returns:
            Evaluation results
        """
        try:
            self.connect_db()
            results = self.evaluate_all_llms()
            return results
        finally:
            self.close_db()
