"""
VidhiSetu-Legal-v0 — Baseline Inference Script
Runs the LLM agent against all 3 tasks and returns reproducible scores.

Required environment variables:
    API_BASE_URL   The API endpoint for the LLM (e.g. https://router.huggingface.co/v1)
    MODEL_NAME     The model identifier to use for inference
    HF_TOKEN       Your Hugging Face / API key

Usage:
    export API_BASE_URL="https://router.huggingface.co/v1"
    export MODEL_NAME="meta-llama/Llama-3.3-70B-Instruct"
    export HF_TOKEN="hf_..."
    python inference.py
"""

import os
import json
import re
import sys
import textwrap
from typing import List, Optional

from openai import OpenAI

# ── Mandatory env vars (per hackathon spec) ───────────────────────────────────

API_BASE_URL = os.getenv("API_BASE_URL", "https://router.huggingface.co/v1")
API_KEY      = os.getenv("HF_TOKEN") or os.getenv("API_KEY", "")
MODEL_NAME   = os.getenv("MODEL_NAME", "meta-llama/Llama-3.3-70B-Instruct")

MAX_TURNS   = 8
TEMPERATURE = 0.0
MAX_TOKENS  = 512

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = textwrap.dedent("""
You are a professional Indian legal counsel specialising in the Bharatiya Nyaya Sanhita (BNS) 2023.

Your task:
1. Read the FIR (First Information Report) scenario carefully.
2. Search the database using action_type "search_database" with a relevant query (1-2 searches max).
3. Submit your final answer using action_type "submit_analysis" with:
   - bns_sections: list of applicable BNS section numbers (e.g. ["318", "319"])
   - crime_categories: list of crime names (e.g. ["fraud", "impersonation"])

Rules:
- Do NOT submit more than 4 BNS sections or 4 crime categories.
- Always submit after at most 3 searches.
- Reply ONLY with a valid JSON object matching this schema:
  {
    "action_type": "search_database" | "submit_analysis",
    "query": "<search string, only for search_database>",
    "bns_sections": ["<section>", ...],
    "crime_categories": ["<category>", ...]
  }
- No extra text, no markdown fences.
""").strip()

# ── Inline env (avoids import path issues when run from repo root) ────────────

def _load_db() -> dict:
    candidates = [
        os.path.join(os.path.dirname(__file__), "openenv", "data", "legalDb.json"),
        os.path.join(os.path.dirname(__file__), "data", "legalDb.json"),
    ]
    for path in candidates:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    return {"categories": []}


TASKS = [
    {
        "id": "easy-burglary-001",
        "difficulty": "easy",
        "scenario": (
            "FIR Report — Sector 4 Police Station:\n"
            "A resident of Sector 4 reported that their house was broken into at 2 AM. "
            "The perpetrators broke the back door lock and stole ₹2 Lakhs worth of gold jewelry. "
            "Neighbours heard sounds of breaking glass. The complainant found the back door forced open in the morning."
        ),
        "expected_bns": ["329", "331", "303"],
        "expected_crime": ["burglary", "house-breaking", "house breaking", "theft", "robbery", "stealing"],
        "max_bns_allowed": 5,
        "max_crime_allowed": 5,
    },
    {
        "id": "medium-cyber-002",
        "difficulty": "medium",
        "scenario": (
            "FIR Report — Cyber Crime Cell:\n"
            "A 55-year-old retired teacher lost ₹50,000 from his savings account. "
            "He received a phone call from someone claiming to be from his bank's fraud prevention department. "
            "The caller said his account was compromised and asked him to share a one-time password (OTP) to 'secure' it. "
            "Trusting the caller, he shared the OTP. Within minutes, ₹50,000 was transferred out of his account. "
            "The caller's number was later found to be a spoofed number."
        ),
        "expected_bns": ["318", "318(4)", "319"],
        "expected_crime": ["cheating", "fraud", "impersonation", "cyber fraud", "scam", "phishing"],
        "max_bns_allowed": 5,
        "max_crime_allowed": 5,
    },
    {
        "id": "hard-dowry-003",
        "difficulty": "hard",
        "scenario": (
            "FIR Report — Women's Crime Branch:\n"
            "A 24-year-old woman, married 18 months ago, was found dead with severe burn injuries in her marital home. "
            "Her husband and in-laws claim it was a kitchen accident. However, her parents state that she had been "
            "subjected to repeated physical assault by her in-laws over the past 6 months. "
            "They allege that the in-laws were aggressively demanding a new car as additional dowry. "
            "Neighbours reported hearing loud arguments and screaming from the house the previous night. "
            "The post-mortem report indicates the burns are inconsistent with an accidental kitchen fire. "
            "The woman had called her mother two days prior, crying and saying she feared for her life."
        ),
        "expected_bns": ["80", "85", "103"],
        "expected_crime": ["dowry death", "cruelty", "dowry", "murder", "homicide"],
        "max_bns_allowed": 6,
        "max_crime_allowed": 6,
    },
]


def _search_db(legal_db: dict, query: str) -> str:
    q = query.lower().strip()
    if not q:
        return "Empty query."
    results = []
    for cat in legal_db.get("categories", []):
        for crime in cat.get("crimes", []):
            blob = (
                f"{crime.get('crime', '')} {crime.get('bns', '')} "
                f"{crime.get('punishment', '')} {cat.get('name', '')} "
                f"{cat.get('description', '')}"
            ).lower()
            if any(word in blob for word in q.split() if len(word) > 2):
                results.append(
                    f"Category: {cat.get('name')} | Crime: {crime.get('crime')} "
                    f"| BNS Section: {crime.get('bns')} | Punishment: {crime.get('punishment')}"
                )
                if len(results) >= 6:
                    break
        if len(results) >= 6:
            break
    return "\n".join(results) if results else f"No matches for '{query}'."


def _grade(task: dict, bns_sections: List[str], crime_categories: List[str]) -> float:
    submitted_bns    = [s.strip().lower() for s in bns_sections]
    submitted_crimes = [s.strip().lower() for s in crime_categories]

    if len(submitted_bns) > task["max_bns_allowed"] or len(submitted_crimes) > task["max_crime_allowed"]:
        return 0.0

    bns_matched = False
    for exp in task["expected_bns"]:
        e = exp.lower()
        for sub in submitted_bns:
            if sub == e or sub.startswith(e + "(") or sub.startswith(e + "-") or sub.startswith(e + " "):
                bns_matched = True
                break
        if bns_matched:
            break

    crime_matched = False
    for exp in task["expected_crime"]:
        e = exp.lower()
        for sub in submitted_crimes:
            if sub == e or re.search(r'\b' + re.escape(e) + r'\b', sub):
                crime_matched = True
                break
        if crime_matched:
            break

    return round((0.5 if bns_matched else 0.0) + (0.5 if crime_matched else 0.0), 2)


def _parse_action(text: str) -> Optional[dict]:
    """Extract JSON action from model response."""
    # Strip markdown fences if present
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find a JSON object anywhere in the response
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return None


def run_baseline() -> dict:
    """Run the LLM agent against all 3 tasks. Returns scores dict."""
    if not API_KEY:
        print("ERROR: HF_TOKEN / API_KEY not set.")
        return {"error": "HF_TOKEN not set", "total_score": 0.0, "tasks": []}

    client = OpenAI(base_url=API_BASE_URL, api_key=API_KEY)
    legal_db = _load_db()

    results = []
    total_score = 0.0

    print("=" * 55)
    print("  VidhiSetu-Legal-v0  |  Baseline Evaluation")
    print(f"  Model : {MODEL_NAME}")
    print(f"  API   : {API_BASE_URL}")
    print("=" * 55)

    for task_idx, task in enumerate(TASKS):
        task_name = task["id"]
        print(f"[START] task={task_name}", flush=True)

        search_results = ""
        previous_searches: set = set()
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        score = 0.0
        turns = 0
        done = False

        while not done and turns < MAX_TURNS:
            turns += 1

            user_content = (
                f"FIR Scenario:\n{task['scenario']}\n\n"
                f"Search Results so far:\n{search_results or '(none yet)'}\n\n"
                f"Turn {turns}/{MAX_TURNS}. Reply with your next JSON action."
            )
            messages.append({"role": "user", "content": user_content})

            try:
                completion = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=TEMPERATURE,
                    max_tokens=MAX_TOKENS,
                    stream=False,
                )
                response_text = completion.choices[0].message.content or ""
            except Exception as exc:
                print(f"  Turn {turns}: model request failed — {exc}", flush=True)
                break

            messages.append({"role": "assistant", "content": response_text})
            action = _parse_action(response_text)

            if action is None:
                print(f"  Turn {turns}: could not parse action, skipping.", flush=True)
                continue

            action_type = action.get("action_type", "")

            if action_type == "search_database":
                query = action.get("query", "").strip()
                if query and query.lower() not in previous_searches:
                    previous_searches.add(query.lower())
                    search_results = _search_db(legal_db, query)
                else:
                    search_results = "Duplicate or empty query."
                print(f"[STEP] step={turns} action=search_database query={query!r} reward=0.05", flush=True)

            elif action_type == "submit_analysis":
                bns    = action.get("bns_sections", [])
                crimes = action.get("crime_categories", [])
                score = _grade(task, bns, crimes)
                done = True
                print(f"[STEP] step={turns} action=submit_analysis bns={bns} crimes={crimes} reward={score}", flush=True)

            else:
                print(f"[STEP] step={turns} action=unknown reward=0.0", flush=True)

        total_score += score
        print(f"[END] task={task_name} score={score} steps={turns}", flush=True)

        results.append({
            "task_idx": task_idx,
            "task_id": task_name,
            "difficulty": task["difficulty"],
            "score": score,
            "turns_taken": turns,
        })

    avg_score = round(total_score / len(TASKS), 4)

    print("\n" + "=" * 55)
    print(f"  TOTAL: {total_score}/{len(TASKS)}  |  AVG: {avg_score}")
    print("=" * 55)

    return {
        "total_score": total_score,
        "average_score": avg_score,
        "num_tasks": len(TASKS),
        "tasks": results,
    }


if __name__ == "__main__":
    run_baseline()


def main():
    run_baseline()
