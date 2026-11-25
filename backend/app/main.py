"""parkpick FastAPI 백엔드 엔트리.

- REST: 인증 / 주차 현황 / 통계 / 이벤트 / 관리자 / 리포트
- WebSocket: /ws/parking 실시간 주차면 상태·이벤트 푸시
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .routers import admin, auth, parking, reports, stats
from .ws import manager, parking_simulator


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(parking_simulator())
    yield
    task.cancel()


app = FastAPI(
    title="parkpick API",
    description="AI 이동체 인지 기반 주차관제·유도 플랫폼 백엔드 (데모)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(stats.router)
app.include_router(admin.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "parkpick-api", "version": "0.1.0"}


@app.websocket("/ws/parking")
async def ws_parking(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep-alive / ping 수신
    except WebSocketDisconnect:
        manager.disconnect(ws)
