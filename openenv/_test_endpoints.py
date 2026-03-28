"""Quick endpoint validation — mimics the automated pre-submission validator."""
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def check(label, condition):
    status = "OK" if condition else "FAIL"
    print(f"  [{status}] {label}")
    if not condition:
        sys.exit(1)

print("=" * 50)
print("  Pre-Submission Endpoint Validator")
print("=" * 50)

# 1. Health check
r = client.get("/")
check("GET / returns 200", r.status_code == 200)
check("GET / has status=ok", r.json().get("status") == "ok")

# 2. reset
r = client.post("/reset?task_idx=0")
check("POST /reset returns 200", r.status_code == 200)
obs = r.json()
check("Observation has task_id", "task_id" in obs)
check("Observation has scenario", "scenario" in obs)
check("Observation has difficulty", "difficulty" in obs)
check("Observation has turns_taken", "turns_taken" in obs)
check("Observation has max_turns", "max_turns" in obs)

# 3. step - search
r = client.post("/step", json={"action_type": "search_database", "query": "burglary"})
check("POST /step (search) returns 200", r.status_code == 200)
data = r.json()
check("step returns observation", "observation" in data)
check("step returns reward", "reward" in data)
check("step returns done", "done" in data)
check("step returns info", "info" in data)
check("done=False after search", data["done"] == False)
reward_score = data["reward"]["score"]
check("reward score in [0,1]", 0.0 <= reward_score <= 1.0)

# 4. step - submit correct
r = client.post("/step", json={
    "action_type": "submit_analysis",
    "bns_sections": ["329"],
    "crime_categories": ["burglary"]
})
check("POST /step (submit) returns 200", r.status_code == 200)
data = r.json()
check("done=True after submit", data["done"] == True)
check("submit score in [0,1]", 0.0 <= data["reward"]["score"] <= 1.0)
check("submit score = 1.0 for correct answer", data["reward"]["score"] == 1.0)

# 5. grader
r = client.get("/grader")
check("GET /grader returns 200", r.status_code == 200)
g = r.json()
check("grader has score", "score" in g)
check("grader score in [0,1]", 0.0 <= g["score"] <= 1.0)
check("grader score matches episode", g["score"] == 1.0)

# 6. state
r = client.get("/state")
check("GET /state returns 200", r.status_code == 200)
s = r.json()
check("state has done field", "done" in s)
check("state done=True after episode", s["done"] == True)
check("state has latest_score", "latest_score" in s)

# 7. tasks
r = client.get("/tasks")
check("GET /tasks returns 200", r.status_code == 200)
t = r.json()
check("tasks has 3+ tasks", len(t.get("tasks", [])) >= 3)
check("tasks has action_schema", "action_schema" in t)
schema_props = t["action_schema"].get("properties", {})
check("action_schema has action_type", "action_type" in schema_props)
check("action_schema has query", "query" in schema_props)
check("action_schema has bns_sections", "bns_sections" in schema_props)
check("action_schema has crime_categories", "crime_categories" in schema_props)

# 8. Grader variance — wrong answer must score 0.0
client.post("/reset?task_idx=0")
r = client.post("/step", json={
    "action_type": "submit_analysis",
    "bns_sections": ["999"],
    "crime_categories": ["xyz_fake_crime"]
})
check("wrong answer scores 0.0", r.json()["reward"]["score"] == 0.0)

# 9. All 3 tasks have different IDs and difficulty progression
r = client.get("/tasks")
tasks = r.json()["tasks"]
ids = [t["id"] for t in tasks]
diffs = [t["difficulty"] for t in tasks]
check("3 unique task IDs", len(set(ids)) == 3)
check("difficulty progression easy->medium->hard", diffs == ["easy", "medium", "hard"])

# 10. reset produces clean state
client.post("/reset?task_idx=2")
r = client.get("/state")
s = r.json()
check("reset clears done flag", s["done"] == False)
check("reset clears turns_taken", s["turns_taken"] == 0)
check("reset clears search_results", s["search_results"] == "")

print()
print("=" * 50)
print("  ALL CHECKS PASSED — Ready for submission")
print("=" * 50)
