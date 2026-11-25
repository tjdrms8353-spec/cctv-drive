"""인증 API — 일반 로그인, 테스트 계정, 관리자 보안 키, OAuth(데모)."""
import re
import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from .. import config, data
from ..auth import create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

# 비밀번호: 영문 대소문자+숫자+특수문자 조합 8자 이상
PW_RULE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]).{8,}$")


class LoginReq(BaseModel):
    email: str
    password: str


class TestLoginReq(BaseModel):
    role: str  # "user" | "test_admin"


class AdminLoginReq(BaseModel):
    secret: str


@router.post("/login")
def login(req: LoginReq):
    if not PW_RULE.match(req.password):
        raise HTTPException(400, "비밀번호는 영문 대소문자·숫자·특수문자 조합 8자 이상이어야 합니다")
    user = next((u for u in data.USERS if u["email"] == req.email), None)
    # 데모: 등록 사용자이거나 테스트 비밀번호면 통과
    if user is None and req.password not in (config.TEST_USER_PASSWORD, config.TEST_ADMIN_PASSWORD):
        raise HTTPException(401, "이메일 또는 비밀번호가 올바르지 않습니다")
    user = user or {"name": "데모 사용자", "email": req.email, "role": "user"}
    return {"token": create_token(user), "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}


@router.post("/test-login")
def test_login(req: TestLoginReq):
    role = "test_admin" if req.role == "test_admin" else "user"
    user = (
        {"name": "테스트 관리자", "email": "test-admin@parkpick.kr", "role": role}
        if role == "test_admin"
        else {"name": "테스트 사용자", "email": "user@parkpick.kr", "role": role}
    )
    return {"token": create_token(user), "user": user}


@router.post("/admin-login")
def admin_login(req: AdminLoginReq):
    # 실제 관리자: .env의 ADMIN_SECRET_KEY와 시크릿 비교 (타이밍 공격 방지)
    if not secrets.compare_digest(req.secret, config.ADMIN_SECRET_KEY):
        raise HTTPException(401, "관리자 보안 키가 올바르지 않습니다")
    user = {"name": "관리자", "email": "admin@parkpick.kr", "role": "admin"}
    data.audit("admin", "ADMIN_LOGIN", "보안 키 인증")
    return {"token": create_token(user), "user": user}


@router.post("/oauth/{provider}")
def oauth_login(provider: str):
    """OAuth 데모 — 실제 환경에서는 Google/Naver/Kakao 인가 코드 검증으로 대체."""
    if provider not in ("google", "naver", "kakao"):
        raise HTTPException(400, "지원하지 않는 제공자입니다")
    user = {"name": f"{provider} 사용자", "email": f"{provider}@oauth.parkpick.kr", "role": "user"}
    return {"token": create_token(user), "user": user}
