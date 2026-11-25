# parkpick

**이동체 영상 데이터 기반 AI 주차관제 및 유도 시스템 (데모 버전)**

주차장 CCTV / K-AI 이동체 인지 영상을 YOLO 객체 탐지·추적 모델로 분석해 주차면 점유를 실시간 판별하고, 운전자에게 빈 주차면 유도, 관리자에게 관제 대시보드를 제공하는 B2B 주차관제 솔루션입니다.

## 팀

| 이름 | 역할 |
|------|------|
| 홍기흥 (조장) | PM / 백엔드·인프라 |
| 박미금 | 프런트엔드 / UI·UX |
| 김모란 | AI 모델링 (Computer Vision) |
| 이오리 | 데이터 분석 / 문서화 |

## 디렉터리

```
backend/    FastAPI 백엔드 (REST + WebSocket, JWT 권한)
frontend/   React(Vite) + Tailwind CSS v4 프런트엔드
ai/         이동체 탐지·추적·점유판별·번호판 OCR 파이프라인
data/       샘플 데이터 (대용량 원본은 .gitignore)
docs/       산출물·진행일지·발표자료
.github/    CI 워크플로우
```

## 로컬 실행

```bash
# 백엔드
python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload --port 8000

# 프런트엔드
cd frontend && npm install && npm run dev        # http://localhost:5173
```

`VITE_API_URL`이 비어 있으면 프런트엔드는 **Mock 데이터 데모 모드**로 동작합니다 (Netlify 데모용).

## 테스트 계정

| 계정 | 방법 | 권한 |
|------|------|------|
| 일반 사용자 | 로그인 페이지 '일반 사용자' 버튼 | 관제·유도·내 차 찾기 |
| 테스트 관리자 | '테스트 관리자' 버튼 | 관리자 화면 **읽기 전용** (쓰기 요청 403) |
| 실제 관리자 | `ADMIN_SECRET_KEY` 입력 | 전체 CRUD |

## 배포 (push 기반 자동 배포, deploy hook 미사용)

- **Render**: 대시보드에서 `render.yaml` Blueprint로 연결 → `main` push 시 `parkpick-api` / `parkpick` 자동 배포
- **Netlify**: 저장소 연결(`netlify.toml` 자동 인식) → push 시 `parkpick.netlify.app` 자동 배포

## 데이터 출처

AI Hub(K-AI 데이터셋, 주차 관련 이동체 인지 영상), 공공데이터포털 주차장 정보 API
