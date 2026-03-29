import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from legal_env import LegalEnv, Action, Observation, Reward, EnvState

# ── App lifecycle ─────────────────────────────────────────────────────────────

env = LegalEnv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # startup / shutdown hook (env already initialised above)

app = FastAPI(
    title="VidhiSetu-Legal-v0 OpenEnv",
    version="1.0.0",
    description="OpenEnv-compliant legal FIR analysis environment based on Bharatiya Nyaya Sanhita (BNS) 2023.",
    lifespan=lifespan,
)

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def ping():
    return {"status": "ok", "environment": "VidhiSetu-Legal-v0", "version": "1.0.0"}


@app.post("/reset", response_model=Observation)
def reset_env(task_idx: int = 0):
    """Reset the environment to a new episode for the given task index (0, 1, or 2)."""
    try:
        obs = env.reset(task_idx=task_idx)
        return obs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/step")
def step_env(action: Action):
    """Execute one action. Returns observation, reward, done flag, and info."""
    try:
        obs, reward, done, info = env.step(action)
        return {
            "observation": obs.model_dump(),
            "reward": reward.model_dump(),
            "done": done,
            "info": info,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/state", response_model=EnvState)
def get_state():
    """Return the full current state of the environment."""
    return env.state()


@app.get("/tasks")
def get_tasks():
    """Return all task definitions and the action schema."""
    return {
        "tasks": [
            {
                "index": i,
                "id": t["id"],
                "difficulty": t["difficulty"],
                "scenario": t["scenario"],
            }
            for i, t in enumerate(env.tasks)
        ],
        "action_schema": Action.model_json_schema(),
    }


@app.get("/grader")
def get_grader():
    """
    Return the grader score for the most recently completed episode.
    Returns 0.0 if no episode has been completed yet.
    """
    s = env.state()
    if s.done:
        return {
            "score": env.latest_reward.score,
            "message": env.latest_reward.message,
            "bns_matched": env.latest_reward.bns_matched,
            "crime_matched": env.latest_reward.crime_matched,
            "task_id": s.task_id,
            "turns_taken": s.turns_taken,
        }
    return {
        "score": 0.0,
        "message": "Episode not yet completed. Call /step with action_type='submit_analysis' to finish.",
        "bns_matched": False,
        "crime_matched": False,
        "task_id": s.task_id,
        "turns_taken": s.turns_taken,
    }


@app.get("/baseline")
async def execute_baseline():
    """
    Run the baseline inference script against all 3 tasks.
    Requires HF_TOKEN and MODEL_NAME environment variables to be set.
    Times out after 120 seconds to respect HF Spaces limits.
    """
    api_key = os.getenv("HF_TOKEN") or os.getenv("API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="HF_TOKEN environment variable is not set. Set it to run the baseline.",
        )
    try:
        from inference import run_baseline
        loop = asyncio.get_running_loop()
        result = await asyncio.wait_for(
            loop.run_in_executor(None, run_baseline),
            timeout=120.0,
        )
        return {"baseline_scores": result}
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Baseline inference timed out after 120 seconds.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
