"""
VidhiSetu-Legal-v0 — Baseline Inference Script
Runs GPT-4o-mini against all 3 tasks and returns reproducible scores.
Usage:
    export OPENAI_API_KEY="sk-..."
    python inference.py
"""

import os
from openai import OpenAI
from legal_env import LegalEnv, Action


SYSTEM_PROMPT = """You are a professional Indian legal counsel specialising in the Bharatiya Nyaya Sanhita (BNS) 2023.

Your task:
1. Read the FIR (First Information Report) scenario carefully.
2. Use 'search_database' to look up relevant BNS sections (1-2 targeted searches).
3. Once you have enough information, use 'submit_analysis' with:
   - bns_sections: list of the most applicable BNS section numbers (e.g. ["318", "319"])
   - crime_categories: list of the crime names (e.g. ["fraud", "impersonation"])

Strategy:
- For easy cases (theft, burglary): search for the crime type directly.
- For medium cases (cyber fraud): search for "cheating" or "impersonation".
- For hard cases (dowry death): search for "dowry" and "cruelty" separately.
- Do NOT submit more than 4 BNS sections or 4 crime categories.
- Always submit after at most 3 searches.
"""


def run_baseline() -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not set.")
        return {"error": "OPENAI_API_KEY not set", "total_score": 0.0, "tasks": []}

    client = OpenAI(api_key=api_key)
    env = LegalEnv()

    results = []
    total_score = 0.0

    print("=" * 55)
    print("  VidhiSetu-Legal-v0  |  Baseline Evaluation")
    print("=" * 55)

    for task_idx in range(len(env.tasks)):
        task_meta = env.tasks[task_idx]
        print(f"\n[Task {task_idx}] {task_meta['id']} ({task_meta['difficulty'].upper()})")

        obs = env.reset(task_idx=task_idx)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        done = False
        final_reward = None
        turns = 0

        while not done and turns < env.max_turns:
            turns += 1

            user_content = (
                f"FIR Scenario:\n{obs.scenario}\n\n"
                f"Search Results so far:\n{obs.search_results or '(none yet)'}\n\n"
                f"System: {obs.system_message}\n\n"
                f"Turn {turns}/{env.max_turns}. Decide your next action."
            )
            messages.append({"role": "user", "content": user_content})

            response = client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=messages,
                response_format=Action,
                temperature=0.0,  # deterministic
            )

            action = response.choices[0].message.parsed
            messages.append({"role": "assistant", "content": response.choices[0].message.content or ""})

            print(f"  Turn {turns}: {action.action_type}", end="")
            if action.action_type == "search_database":
                print(f" → '{action.query}'")
            else:
                print(f" → BNS={action.bns_sections}, Crimes={action.crime_categories}")

            obs, reward, done, info = env.step(action)
            print(f"           Reward: {reward.score} — {reward.message}")

            if done:
                final_reward = reward

        score = final_reward.score if final_reward else 0.0
        total_score += score

        results.append({
            "task_idx": task_idx,
            "task_id": task_meta["id"],
            "difficulty": task_meta["difficulty"],
            "score": score,
            "turns_taken": info.get("turns_taken", turns),
            "bns_matched": final_reward.bns_matched if final_reward else False,
            "crime_matched": final_reward.crime_matched if final_reward else False,
        })

        print(f"  → Final Score: {score}/1.0")

    avg_score = round(total_score / len(env.tasks), 4)

    print("\n" + "=" * 55)
    print(f"  TOTAL: {total_score}/{len(env.tasks)}  |  AVG: {avg_score}")
    print("=" * 55)

    return {
        "total_score": total_score,
        "average_score": avg_score,
        "num_tasks": len(env.tasks),
        "tasks": results,
    }


if __name__ == "__main__":
    run_baseline()
