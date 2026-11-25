"""WebSocket 실시간 푸시 — 주차면 상태 변경 시뮬레이터.

실제 환경에서는 AI 추론 파이프라인(ai/pipeline.py)이 탐지 결과를
발행하면 이 매니저가 구독 클라이언트에 브로드캐스트합니다.
"""
import asyncio
import json
import random
from datetime import datetime

from fastapi import WebSocket

from . import data


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict) -> None:
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(message, ensure_ascii=False))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


async def parking_simulator() -> None:
    """3초 간격으로 임의 주차면의 점유 상태를 토글해 실시간 갱신을 시뮬레이션."""
    while True:
        await asyncio.sleep(3)
        if not manager.active:
            continue
        spots = data.LOT["spots"]
        target = random.choice(spots)
        target["status"] = "occupied" if target["status"] == "free" else "free"
        if target["status"] == "occupied":
            target["plate"] = f"{10 + random.randint(0, 80)}하 {random.randint(1000, 9999)}"
            target["since"] = datetime.now().strftime("%H:%M")
        else:
            target["plate"] = None
            target["since"] = None
        await manager.broadcast({"type": "lot", "payload": data.LOT})
        if random.random() < 0.08:
            event = {
                "id": data.next_event_id(),
                "type": "congestion",
                "label": "혼잡",
                "spot": f"{target['floor']}-{target['zone']}",
                "floor": target["floor"],
                "level": "info",
                "message": f"{target['id']} 구역 점유 상태 변경 감지",
                "time": datetime.now().strftime("%H:%M:%S"),
                "resolved": False,
            }
            data.EVENTS.insert(0, event)
            await manager.broadcast({"type": "event", "payload": event})
