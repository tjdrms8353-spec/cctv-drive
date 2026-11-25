"""통계 / 이벤트 API."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .. import data
from ..auth import block_test_admin_writes, current_user

router = APIRouter(prefix="/api", tags=["stats", "events"])


@router.get("/stats")
def get_stats():
    return data.STATS


@router.get("/events")
def get_events():
    return data.EVENTS


class EventPatch(BaseModel):
    resolved: bool


@router.patch("/events/{event_id}")
def patch_event(event_id: int, req: EventPatch, user: dict = Depends(block_test_admin_writes)):
    if user["role"] not in ("admin",):
        raise HTTPException(403, "관리자만 이벤트를 처리할 수 있습니다")
    event = next((e for e in data.EVENTS if e["id"] == event_id), None)
    if event is None:
        raise HTTPException(404, "이벤트를 찾을 수 없습니다")
    event["resolved"] = req.resolved
    data.audit(user["email"], "EVENT_RESOLVE" if req.resolved else "EVENT_REOPEN", f"event#{event_id}")
    return event
