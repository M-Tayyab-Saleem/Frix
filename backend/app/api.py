"""FastAPI app exposing the orchestration workflow.

Run with:
    uvicorn app.api:app --reload
    # or, for the CLI entrypoint defined in main.py:
    python main.py
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .runtime import run_workflow
from .schemas import OrchestrateRequest, OrchestratorResponse

logger = logging.getLogger("ai_orchestrator")

app = FastAPI(
    title="AI Service Orchestrator",
    description=(
        "Multi-agent backend for the informal-economy service marketplace. "
        "Takes a natural-language request (Urdu / Roman Urdu / English) and "
        "returns parsed intent, top-3 ranked providers, a simulated booking, "
        "and a scheduled follow-up reminder."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/orchestrate", response_model=OrchestratorResponse)
async def orchestrate(req: OrchestrateRequest) -> OrchestratorResponse:
    """Run the full agentic workflow for a single user request."""
    try:
        return await run_workflow(req)
    except Exception as exc:  # surface model/tool failures to the client
        logger.exception("Workflow failed")
        raise HTTPException(status_code=500, detail=f"workflow_failed: {exc}") from exc
