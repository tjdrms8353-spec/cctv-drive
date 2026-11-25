"""JWT 인증 + 권한 의존성.

- role: user | admin | test_admin
- test_admin은 모든 쓰기 요청(POST/PUT/PATCH/DELETE)을 403으로 차단
- 모든 권한 검증은 백엔드에서 최종 수행 (프런트 분기는 UI용)
"""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import config

bearer = HTTPBearer(auto_error=False)


def create_token(user: dict) -> str:
    payload = {
        "sub": user["email"],
        "name": user["name"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(minutes=config.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm="HS256")


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "로그인이 필요합니다")
    try:
        payload = jwt.decode(creds.credentials, config.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "유효하지 않은 토큰입니다")
    return {"email": payload["sub"], "name": payload.get("name", ""), "role": payload.get("role", "user")}


def require_roles(*roles: str):
    def dep(user: dict = Depends(current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "권한이 없습니다")
        return user

    return dep


require_admin = require_roles("admin")
require_any_admin = require_roles("admin", "test_admin")


async def block_test_admin_writes(request: Request, user: dict = Depends(current_user)) -> dict:
    """쓰기 엔드포인트 공통 방어선 — test_admin의 변경 요청을 403으로 차단."""
    if request.method != "GET" and user["role"] == "test_admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "테스트 관리자 계정은 읽기 전용입니다")
    return user
