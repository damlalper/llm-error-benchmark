"""
Main script to run LLM evaluation
"""

import json
import sys
from datetime import datetime
from evaluator import LLMEvaluator

# Fix Windows console encoding
if sys.platform == 'win32':
    import os
    os.system('chcp 65001 >nul')
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')


def print_results(results):
    """Print evaluation results in a nice format"""
    print("\n" + "="*70)
    print("📊 LLM EVALUATION RESULTS")
    print("="*70 + "\n")

    print(f"📅 Evaluation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Rankings
    print("🏆 OVERALL RANKING:\n")
    for rank, (llm_name, score) in enumerate(results['ranking'], 1):
        medal = "🥇" if rank == 1 else "🥈" if rank == 2 else "🥉" if rank == 3 else f"{rank}."
        print(f"   {medal} {llm_name.upper().ljust(25)} {score:.2f}/100")

    print("\n" + "-"*70 + "\n")

    # Best and Worst
    print(f"🏆 BEST LLM:  {results['best_llm'].upper()} ({results['scores'][results['best_llm']]:.2f}/100)")
    print(f"💔 WORST LLM: {results['worst_llm'].upper()} ({results['scores'][results['worst_llm']]:.2f}/100)\n")

    print("-"*70 + "\n")

    # Detailed scores
    print("📋 DETAILED CRITERION SCORES:\n")
    for llm_name in [llm for llm, _ in results['ranking']]:
        details = results['details'][llm_name]
        print(f"   {llm_name.upper()}:")
        print(f"      Technical Accuracy:  {details['criterion_scores']['technical_accuracy']:.2f}/25")
        print(f"      Solution Quality:    {details['criterion_scores']['solution_quality']:.2f}/25")
        print(f"      Clarity:             {details['criterion_scores']['clarity']:.2f}/20")
        print(f"      Conciseness:         {details['criterion_scores']['conciseness']:.2f}/10")
        print(f"      Speed:               {details['criterion_scores']['speed']:.2f}/10")
        print(f"      Reliability:         {details['criterion_scores']['reliability']:.2f}/10")
        print(f"      ─────────────────────────────────────")
        print(f"      TOTAL:               {details['average_score']:.2f}/100\n")

    print("="*70 + "\n")


def save_results(results, filename='evaluation_results.json'):
    """Save results to JSON file"""
    output = {
        'evaluation_date': datetime.now().isoformat(),
        'scores': results['scores'],
        'ranking': [(llm, score) for llm, score in results['ranking']],
        'best_llm': {
            'name': results['best_llm'],
            'score': results['scores'][results['best_llm']]
        },
        'worst_llm': {
            'name': results['worst_llm'],
            'score': results['scores'][results['worst_llm']]
        },
        'detailed_scores': results['details']
    }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"💾 Results saved to {filename}\n")


def main():
    """Main execution"""
    print("\n" + "="*70)
    print("🚀 LLM EVALUATION SYSTEM")
    print("="*70 + "\n")

    # Run evaluation
    evaluator = LLMEvaluator()
    results = evaluator.run()

    # Print results (to console and file)
    print_results(results)

    # Save detailed report to text file
    with open('evaluation_report.txt', 'w', encoding='utf-8') as f:
        original_stdout = sys.stdout
        sys.stdout = f
        print_results(results)
        sys.stdout = original_stdout

    print("📄 Detailed report saved to evaluation_report.txt")

    # Save results
    save_results(results)

    print("✅ Evaluation complete!\n")


if __name__ == "__main__":
    main()
