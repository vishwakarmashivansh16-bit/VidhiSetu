---
title: VidhiSetu Legal Environment
emoji: ⚖️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
tags:
  - openenv
---

# VidhiSetu-Legal-v0

An OpenEnv-compliant environment that simulates the real-world task of a junior legal counsel analysing First Information Reports (FIRs) under India's **Bharatiya Nyaya Sanhita (BNS) 2023**.

## Environment Description

Processing unstructured incident reports into formal statutory charges is a daily task in the Indian legal system. This environment forces agents to:

1. Read an FIR scenario (unstructured natural language)
2. Query a structured BNS legal database using targeted search
3. Identify the correct BNS sections and crime categories

This tests multi-step tool use, legal reasoning, and information retrieval — skills directly applicable to real-world legal AI systems.

---

## Observation Space

The agent receives an `Observation` object with:

| Field | Type | Description |
|---|---|---|
| `task_id` | str | Unique task identifier |
| `difficulty` | str | `easy` / `medium` / `hard` |
| `scenario` | str | The FIR text to analyse |
| `search_results` | str | Results from last `search_database` action |
| `system_message` | str | Environmental feedback |
| `turns_taken` | int | Turns used so far |
| `max_turns` | int | Maximum turns allowed (10) |

---

## Action Space

The agent submits an `Action` object with:

| Field | Type | Description |
|---|---|---|
| `action_type` | `"search_database"` \| `"submit_analysis"` | Action to perform |
| `query` | str | Search query (for `search_database`) |
| `bns_sections` | List[str] | BNS section numbers to submit (for `submit_analysis`) |
| `crime_categories` | List[str] | Crime names to submit (for `submit_analysis`) |

---

## Reward Function

Rewards are shaped across the full trajectory (not sparse):

| Event | Reward |
|---|---|
| First 2 unique `search_database` queries | +0.05 each (max +0.10) |
| Duplicate search query | -0.05 |
| 3rd+ unique search | 0.0 |
| `submit_analysis` — correct BNS section | +0.50 |
| `submit_analysis` — correct crime category | +0.50 |
| `submit_analysis` — spam (too many answers) | 0.0 total |
| Timeout (max turns without submission) | 0.0 |

**Maximum score per episode: 1.0**

---

## Tasks

### Task 0 — Easy: Night Burglary (`easy-burglary-001`)
A residential break-in at 2 AM with stolen jewelry. Agents can identify the crime type with a single targeted search.
- Expected BNS: `329`, `331`, `303`
- Expected crime: `burglary`, `house-breaking`, `theft`

### Task 1 — Medium: OTP Phishing Scam (`medium-cyber-002`)
A victim is tricked into sharing an OTP by someone impersonating a bank official. Requires distinguishing cyber-specific BNS sections from general theft.
- Expected BNS: `318`, `318(4)`, `319`
- Expected crime: `cheating`, `fraud`, `impersonation`

### Task 2 — Hard: Dowry Death (`hard-dowry-003`)
A young married woman found dead with burn injuries, prior assault history, and dowry demands. Requires synthesising multiple legal concepts (dowry death, cruelty, murder) and identifying specific BNS sections.
- Expected BNS: `80`, `85`, `103`
- Expected crime: `dowry death`, `cruelty`, `murder`

---

## Setup & Usage

### Local Setup

```bash
git clone <repo-url>
cd openenv
pip install -r requirements.txt
```

### Run the API server

```bash
uvicorn app:app --host 0.0.0.0 --port 7860
```

### Run interactively (CLI)

```bash
python legal_env.py
```

### Python usage

```python
from legal_env import LegalEnv, Action

env = LegalEnv()
obs = env.reset(task_idx=0)
print(obs.scenario)

# Search
obs, reward, done, info = env.step(
    Action(action_type="search_database", query="house breaking")
)
print(obs.search_results)

# Submit
obs, reward, done, info = env.step(
    Action(action_type="submit_analysis", bns_sections=["329"], crime_categories=["burglary"])
)
print(reward.score, reward.message)
```

### Docker

```bash
docker build -t vidhisetu-legal .
docker run -p 7860:7860 -e OPENAI_API_KEY=sk-... vidhisetu-legal
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/reset?task_idx=0` | Reset environment for a task |
| POST | `/step` | Execute one action |
| GET | `/state` | Get full current state |
| GET | `/tasks` | List tasks and action schema |
| GET | `/grader` | Score of last completed episode |
| GET | `/baseline` | Run baseline inference (requires `OPENAI_API_KEY`) |

---

## Baseline Scores

Run with GPT-4o-mini (`temperature=0.0` for reproducibility):

```bash
export OPENAI_API_KEY="sk-..."
python inference.py
```

| Task | Difficulty | Score |
|---|---|---|
| easy-burglary-001 | Easy | 1.0 / 1.0 |
| medium-cyber-002 | Medium | 1.0 / 1.0 |
| hard-dowry-003 | Hard | 0.5 / 1.0 |
| **Total** | | **2.5 / 3.0** |

The hard task (dowry death) requires multi-concept synthesis and GPT-4o-mini does not always identify all three BNS sections correctly, resulting in a partial score.

---

## OpenEnv Validation

```bash
openenv validate openenv.yaml
```
