"""AI 운영 리포트 API — GEMINI_API_KEY 설정 시 LLM 생성, 미설정 시 규칙 기반."""
from fastapi import APIRouter, Depends

from .. import config, data
from ..auth import block_test_admin_writes, current_user

router = APIRouter(prefix="/api/reports", tags=["reports"], dependencies=[Depends(current_user)])


@router.get("")
def list_reports():
    return data.REPORTS


@router.post("/generate")
def generate_report(user: dict = Depends(block_test_admin_writes)):
    if user["role"] != "admin":
        from fastapi import HTTPException

        raise HTTPException(403, "실제 관리자만 리포트를 생성할 수 있습니다")
    # TODO(이오리): GEMINI_API_KEY 설정 시 Gemini API 프롬프트로 대체
    if config.GEMINI_API_KEY:
        pass  # httpx로 Gemini 호출 → 실패 시 규칙 기반 폴백
    report = data.generate_report_body()
    data.REPORTS.insert(0, report)
    data.audit(user["email"], "REPORT_GENERATE", report["title"])
    return report
