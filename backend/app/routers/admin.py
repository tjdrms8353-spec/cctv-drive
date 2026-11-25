"""관리자 API — 회원 관리, 리포트 생성 (test_admin은 조회만 허용)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .. import data
from ..auth import block_test_admin_writes, require_any_admin, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_any_admin)])


@router.get("/users")
def list_users():
    return data.USERS


class RolePatch(BaseModel):
    role: str


@router.patch("/users/{user_id}")
def patch_user_role(user_id: int, req: RolePatch, user: dict = Depends(block_test_admin_writes)):
    if user["role"] != "admin":
        raise HTTPException(403, "실제 관리자만 권한을 변경할 수 있습니다")
    if req.role not in ("user", "admin", "test_admin"):
        raise HTTPException(400, "유효하지 않은 권한입니다")
    target = next((u for u in data.USERS if u["id"] == user_id), None)
    if target is None:
        raise HTTPException(404, "사용자를 찾을 수 없습니다")
    target["role"] = req.role
    data.audit(user["email"], "ROLE_CHANGE", f"user#{user_id} -> {req.role}")
    return target


@router.get("/audit-log")
def audit_log(user: dict = Depends(require_admin)):
    return data.AUDIT_LOG
