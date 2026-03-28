import json
import os
import random

# Load the legal database
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'legalDb.json')

class LegalEnv:
    """
    OpenEnv Python Core for the React Application.
    This environment tests the AI's ability to recommend the correct BNS sections
    and crimes given a specific scenario.
    """
    def __init__(self):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            self.legal_db = json.load(f)

        # 3 Specific Legal Scenarios (The Tasks)
        self.tasks = [
            {
                "id": 1,
                "description": "A group of people broke into a house at night by picking the lock and stole jewelry.",
                "expected_bns": ["329", "331"],
                "expected_crime": ["burglary", "house-breaking", "house breaking", "theft", "robbery"]
            },
            {
                "id": 2,
                "description": "A man posed as a bank official on a phone call and convinced a victim to share their OTP, stealing ₹50,000.",
                "expected_bns": ["318", "318(4)", "319"],
                "expected_crime": ["cheating", "fraud", "impersonation", "cyber fraud"]
            },
            {
                "id": 3,
                "description": "A woman died under suspicious circumstances within two years of marriage, and it was found she was being harassed for a car by her in-laws.",
                "expected_bns": ["80", "85"],
                "expected_crime": ["dowry death", "cruelty", "dowry"]
            }
        ]
        self.current_task_idx = 0
        self.done = False

    def reset(self, task_idx=None):
        """Resets the environment and loads a scenario."""
        if task_idx is not None and 0 <= task_idx < len(self.tasks):
            self.current_task_idx = task_idx
        else:
            self.current_task_idx = random.randint(0, len(self.tasks) - 1)
        self.done = False
        return self.state()

    def state(self):
        """Returns the current state of the environment."""
        return {
            "scenario": self.tasks[self.current_task_idx]["description"],
            "done": self.done
        }

    def step(self, ai_answer: str):
        """Processes the AI's answer, grades it against the database, and returns the result."""
        if self.done:
            return self.state(), 0, self.done, "Scenario already complete."
            
        task = self.tasks[self.current_task_idx]
        score = self._grader(ai_answer, task)
        self.done = True
        
        return self.state(), score, self.done, "Graded successfully."

    def _grader(self, answer: str, task: dict):
        """
        Grader that checks if the AI's answer matches the legalDb.json data.
        Returns a score from 0 to 2.
        1 point for identifying the correct BNS section.
        1 point for identifying the correct crime category.
        """
        ans_lower = str(answer).lower()
        score = 0
        
        # Check if expected BNS is mentioned
        for bns in task["expected_bns"]:
            if bns.lower() in ans_lower:
                score += 1
                break
                
        # Check if crime is properly identified
        for crime in task["expected_crime"]:
            if crime.lower() in ans_lower:
                score += 1
                break
                
        return score

if __name__ == "__main__":
    env = LegalEnv()
    
    print("=========================================")
    print("      VidhiSetu OpenEnv Python Core      ")
    print("=========================================")
    
    for i in range(3):
        print(f"\n--- Task {i+1} ---")
        state = env.reset(task_idx=i)
        print(f"Scenario: {state['scenario']}")
        
        # Simulated AI response for demonstration
        simulated_response = f"Based on the BNS {env.tasks[i]['expected_bns'][0]}, this is considered {env.tasks[i]['expected_crime'][0]}."
        print(f"AI Answer: {simulated_response}")
        
        next_state, score, done, info = env.step(simulated_response)
        print(f"Score: {score}/2")
        print(f"Status: {info}")
