"""
pr.py — GitHub PR API Route
============================
POST /api/v1/pr/create
  Body: { incident_id, service_name, context, repo (optional), base_branch (optional) }
  Returns: { success, pr_url, branch_name, pr_number, error }

This is what the dashboard "Create PR" button calls.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.github_pr import GitHubPRService

router = APIRouter(prefix="/pr")

# Shared service instance (reads GITHUB_TOKEN + GITHUB_REPO from env)
_pr_service = GitHubPRService()


class PRRequest(BaseModel):
    incident_id: str
    service_name: str
    context: dict                        # the Context dict from reconstruct
    repo: Optional[str] = None           # override env GITHUB_REPO if needed
    base_branch: Optional[str] = "main"


@router.post("/create")
async def create_pr(payload: PRRequest):
    """
    Creates an automated GitHub PR for the given incident.
    
    Demo flow:
    1. Dashboard shows "Suggested Fix" for INC-002
    2. User clicks "Create PR"
    3. This endpoint fires
    4. A real PR appears in the shopflow-target GitHub repo
    5. Dashboard shows the PR link
    """
    # Allow per-request repo override (useful for demo with different targets)
    service = _pr_service
    if payload.repo:
        from app.services.github_pr import GitHubPRService
        service = GitHubPRService(repo=payload.repo)

    result = service.create_fix_pr(
        incident_id=payload.incident_id,
        service_name=payload.service_name,
        context=payload.context,
        base_branch=payload.base_branch or "main",
    )

    if not result.success:
        # Return 200 with error info so the dashboard can display it cleanly
        return {
            "success": False,
            "error": result.error,
            "pr_url": None,
            "branch_name": None,
            "pr_number": None,
        }

    return result.to_dict()


@router.get("/status")
async def pr_service_status():
    """Check if GitHub credentials are configured."""
    from app.core.config import get_settings
    settings = get_settings()
    token_set = bool(settings.github_token)
    repo_set  = bool(settings.github_repo)
    return {
        "github_token_configured": token_set,
        "github_repo_configured": repo_set,
        "ready": token_set and repo_set,
    }
