"""
server/app.py — OpenEnv multi-mode deployment entry point.
This module re-exports the FastAPI app from the root app.py and provides
the main() function required by the [project.scripts] server entry point.
"""
import os
import sys

# Ensure repo root is on the path so root-level modules are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app  # noqa: F401 — re-export for uvicorn


def main() -> None:
    """Entry point for 'server' script (required by OpenEnv multi-mode deployment)."""
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
