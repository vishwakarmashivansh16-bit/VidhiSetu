import json
import os
import re
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Tuple, Dict, Any

# ── Typed Models ──────────────────────────────────────────────────────────────

class Action(BaseModel):
    action_type: Literal["search_database", "submit_analysis"] = Field(
        ..., description="'search_database' to query BNS database, 'submit_analysis' to submit final answer."
    )
    query: str = Field(
        default="", description="Search query for the BNS database. Used when action_type='search_database'."
    )
    bns_sections: List[str] = Field(
        default_factory=list,
        description="List of BNS section numbers identified (e.g. ['329', '318(4)']). Used when action_type='submit_analysis'."
    )
    crime_categories: List[str] = Field(
        default_factory=list,
        description="List of crime category names (e.g. ['theft', 'fraud']). Used when action_type='submit_analysis'."
    )

class Observation(BaseModel):
    task_id: str = Field(..., description="Unique identifier for the current task.")
    difficulty: str = Field(..., description="Task difficulty: easy | medium | hard.")
    scenario: str = Field(..., description="The FIR (First Information Report) text to analyse.")
    search_results: str = Field(default="", description="Results from the last search_database action.")
    system_message: str = Field(default="", description="Environmental feedback and instructions.")
    turns_taken: int = Field(default=0, description="Number of turns used so far.")
    max_turns: int = Field(default=10, description="Maximum turns allowed per episode.")

class Reward(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Reward score between 0.0 and 1.0.")
    message: str = Field(..., description="Human-readable explanation of the reward.")
    bns_matched: bool = Field(default=False, description="Whether a correct BNS section was identified.")
    crime_matched: bool = Field(default=False, description="Whether a correct crime category was identified.")

class EnvState(BaseModel):
    task_id: str
    difficulty: str
    scenario: str
    search_results: str
    system_message: str
    turns_taken: int
    max_turns: int
    done: bool
    latest_score: float
    previous_searches: List[str]

# ── Constants ─────────────────────────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "legalDb.json")

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
        # Any ONE of these BNS sections counts as correct
        "expected_bns": ["329", "331", "303"],
        # Any ONE of these crime labels counts as correct
        "expected_crime": ["burglary", "house-breaking", "house breaking", "theft", "robbery", "stealing"],
        # Penalty if agent submits more than this many BNS sections (spam guard)
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


# ── Environment ───────────────────────────────────────────────────────────────

class LegalEnv:
    """
    VidhiSetu-Legal-v0: An OpenEnv-compliant environment simulating legal FIR analysis
    under the Bharatiya Nyaya Sanhita (BNS) 2023.
    """

    def __init__(self):
        try:
            with open(DB_PATH, "r", encoding="utf-8") as f:
                self.legal_db = json.load(f)
        except Exception:
            self.legal_db = {"categories": []}

        self.tasks = TASKS
        self.max_turns = 10
        self._reset_state(0)

    def _reset_state(self, task_idx: int):
        self.current_task_idx = max(0, min(task_idx, len(self.tasks) - 1))
        self.done = False
        self.last_search_result = ""
        self.turns_taken = 0
        self.previous_searches: set = set()
        self.latest_reward = Reward(score=0.0, message="Episode not yet completed.", bns_matched=False, crime_matched=False)
        self.system_message = (
            "Task loaded. You are a junior legal counsel. "
            "Read the FIR scenario carefully, use 'search_database' to look up relevant BNS sections, "
            "then use 'submit_analysis' with your final BNS sections and crime categories."
        )

    def reset(self, task_idx: int = 0) -> Observation:
        """Reset the environment to a new episode. Returns initial observation."""
        self._reset_state(task_idx)
        return self._make_observation()

    def state(self) -> EnvState:
        """Return full current state of the environment."""
        task = self.tasks[self.current_task_idx]
        return EnvState(
            task_id=task["id"],
            difficulty=task["difficulty"],
            scenario=task["scenario"],
            search_results=self.last_search_result,
            system_message=self.system_message,
            turns_taken=self.turns_taken,
            max_turns=self.max_turns,
            done=self.done,
            latest_score=self.latest_reward.score,
            previous_searches=list(self.previous_searches),
        )

    def _make_observation(self) -> Observation:
        task = self.tasks[self.current_task_idx]
        return Observation(
            task_id=task["id"],
            difficulty=task["difficulty"],
            scenario=task["scenario"],
            search_results=self.last_search_result,
            system_message=self.system_message,
            turns_taken=self.turns_taken,
            max_turns=self.max_turns,
        )

    def _search_db(self, query: str) -> str:
        q = query.lower().strip()
        if not q:
            return "Empty query. Please provide a search term."

        results = []
        for cat in self.legal_db.get("categories", []):
            for crime in cat.get("crimes", []):
                text_blob = (
                    f"{crime.get('crime', '')} {crime.get('bns', '')} "
                    f"{crime.get('punishment', '')} {cat.get('name', '')} "
                    f"{cat.get('description', '')}"
                ).lower()
                if any(word in text_blob for word in q.split() if len(word) > 2):
                    results.append(
                        f"Category: {cat.get('name')} | Crime: {crime.get('crime')} "
                        f"| BNS Section: {crime.get('bns')} | Punishment: {crime.get('punishment')}"
                    )
                    if len(results) >= 6:
                        break
            if len(results) >= 6:
                break

        if not results:
            return f"No matches found for '{query}'. Try different keywords like crime type or victim description."
        return "\n".join(results)

    def _grade_submission(self, action: Action) -> Reward:
        """
        Deterministic grader. Scores 0.0–1.0.
        - 0.5 for correct BNS section (partial match allowed, e.g. '318' matches '318(4)')
        - 0.5 for correct crime category (substring match, case-insensitive)
        - Spam penalty: if agent submits far too many answers, score zeroed
        - Efficiency bonus: +0.0 (score is capped at 1.0 regardless)
        """
        task = self.tasks[self.current_task_idx]

        submitted_bns = [str(b).strip().lower() for b in action.bns_sections]
        submitted_crimes = [str(c).strip().lower() for c in action.crime_categories]

        # Spam guard — penalise shotgun submissions
        if len(submitted_bns) > task["max_bns_allowed"]:
            return Reward(
                score=0.0,
                message=f"Spam penalty: submitted {len(submitted_bns)} BNS sections (max {task['max_bns_allowed']} allowed).",
                bns_matched=False,
                crime_matched=False,
            )
        if len(submitted_crimes) > task["max_crime_allowed"]:
            return Reward(
                score=0.0,
                message=f"Spam penalty: submitted {len(submitted_crimes)} crime categories (max {task['max_crime_allowed']} allowed).",
                bns_matched=False,
                crime_matched=False,
            )

        # BNS grading — Strict prefix match for BNS sections (prevents '80' matching '180')
        bns_matched = False
        for exp in task["expected_bns"]:
            exp_lower = exp.lower()
            for sub in submitted_bns:
                # Match exactly, or if it has a suffix like (4)
                if sub == exp_lower or sub.startswith(exp_lower + "(") or sub.startswith(exp_lower + "-") or sub.startswith(exp_lower + " "):
                    bns_matched = True
                    break
            if bns_matched:
                break

        # Crime grading — Strict word boundary match (prevents single-letter exploit)
        crime_matched = False
        for exp in task["expected_crime"]:
            exp_lower = exp.lower()
            for sub in submitted_crimes:
                if sub == exp_lower or re.search(r'\b' + re.escape(exp_lower) + r'\b', sub):
                    crime_matched = True
                    break
            if crime_matched:
                break

        bns_score = 0.5 if bns_matched else 0.0
        crime_score = 0.5 if crime_matched else 0.0
        final_score = round(bns_score + crime_score, 2)

        if final_score == 1.0:
            msg = "Perfect — correct BNS section and crime category identified."
        elif bns_matched:
            msg = "Partial: correct BNS section, but crime category was incorrect or missing."
        elif crime_matched:
            msg = "Partial: correct crime category, but BNS section was incorrect or missing."
        else:
            msg = "Incorrect — neither BNS section nor crime category matched. Review the FIR and search again."

        return Reward(score=final_score, message=msg, bns_matched=bns_matched, crime_matched=crime_matched)

    def step(self, action: Action) -> Tuple[Observation, Reward, bool, Dict[str, Any]]:
        """
        Execute one action. Returns (observation, reward, done, info).
        """
        if self.done:
            return (
                self._make_observation(),
                Reward(score=0.0, message="Episode already finished. Call reset() to start a new episode.", bns_matched=False, crime_matched=False),
                True,
                {"turns_taken": self.turns_taken},
            )

        self.turns_taken += 1

        # Timeout — force end if max turns reached without submission
        if self.turns_taken >= self.max_turns and action.action_type != "submit_analysis":
            self.done = True
            self.system_message = "Maximum turns reached. Episode terminated with zero score."
            r = Reward(score=0.0, message="Timeout: exceeded maximum turns without submitting.", bns_matched=False, crime_matched=False)
            self.latest_reward = r
            return self._make_observation(), r, True, {"turns_taken": self.turns_taken}

        if action.action_type == "search_database":
            query_lower = action.query.lower().strip()

            if not query_lower:
                reward_score = -0.05
                msg = "Penalty: empty search query."
            elif query_lower in self.previous_searches:
                reward_score = -0.05
                msg = f"Penalty: duplicate search query '{action.query}'. Try a different keyword."
            else:
                self.previous_searches.add(query_lower)
                self.last_search_result = self._search_db(action.query)
                # Reward capped: max 0.1 total from searches (2 unique searches × 0.05)
                search_count = len(self.previous_searches)
                if search_count <= 2:
                    reward_score = 0.05
                else:
                    reward_score = 0.0  # No reward for excessive searching
                msg = f"Search completed for '{action.query}'."

            self.system_message = msg
            r = Reward(score=max(0.0, reward_score), message=msg, bns_matched=False, crime_matched=False)
            self.latest_reward = r
            return self._make_observation(), r, False, {"turns_taken": self.turns_taken}

        elif action.action_type == "submit_analysis":
            self.done = True
            r = self._grade_submission(action)
            self.latest_reward = r
            self.system_message = f"Episode complete. Final score: {r.score}. {r.message}"
            return self._make_observation(), r, True, {"turns_taken": self.turns_taken}

        else:
            self.system_message = "Invalid action_type. Use 'search_database' or 'submit_analysis'."
            r = Reward(score=0.0, message="Invalid action type.", bns_matched=False, crime_matched=False)
            self.latest_reward = r
            return self._make_observation(), r, False, {"turns_taken": self.turns_taken}


# ── Interactive CLI (for local testing) ──────────────────────────────────────

if __name__ == "__main__":
    env = LegalEnv()
    print("=" * 50)
    print("  VidhiSetu Legal Environment — CLI Test")
    print("=" * 50)

    for task_idx in range(len(env.tasks)):
        task_info = env.tasks[task_idx]
        print(f"\n--- Task {task_idx} ({task_info['difficulty'].upper()}) ---")
        obs = env.reset(task_idx)
        print(f"\nFIR:\n{obs.scenario}\n")

        while not env.done:
            print("Actions: [1] Search Database  [2] Submit Analysis")
            choice = input("Choice: ").strip()
            if choice == "1":
                q = input("Search query: ").strip()
                act = Action(action_type="search_database", query=q)
                obs, reward, done, info = env.step(act)
                print(f"\nResults:\n{obs.search_results}\n")
            elif choice == "2":
                bns = [b.strip() for b in input("BNS sections (comma-separated): ").split(",") if b.strip()]
                crimes = [c.strip() for c in input("Crime categories (comma-separated): ").split(",") if c.strip()]
                act = Action(action_type="submit_analysis", bns_sections=bns, crime_categories=crimes)
                obs, reward, done, info = env.step(act)
            else:
                print("Invalid choice.")
                continue
            print(f"Reward: {reward.score} — {reward.message}")

        print(f"\nFinal Score: {env.latest_reward.score}/1.0\n{'=' * 50}")
