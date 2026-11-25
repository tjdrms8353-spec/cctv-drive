"""데모용 인메모리 데이터.

DATABASE_URL 미설정(또는 sqlite) 환경에서 동작하는 Mock 저장소입니다.
프로덕션에서는 TiDB/MySQL로 대체합니다.
"""
import random
from datetime import datetime, timedelta

random.seed(20261125)


def _make_spots(floor: str, zone: str, count: int, occupied_ratio: float) -> list[dict]:
    spots = []
    for i in range(1, count + 1):
        spot_type = "normal"
        if i % 15 == 0:
            spot_type = "disabled"
        elif i % 11 == 0:
            spot_type = "ev"
        elif i % 17 == 0:
            spot_type = "reserved"
        status = "occupied" if random.random() < occupied_ratio else "free"
        spots.append(
            {
                "id": f"{floor}-{zone}{i:02d}",
                "floor": floor,
                "zone": zone,
                "num": i,
                "type": spot_type,
                "status": status,
                "plate": f"{10 + i}가 {1000 + i * 7}" if status == "occupied" else None,
                "since": f"2026-11-25 0{8 + (i % 3)}:{10 + i}" if status == "occupied" else None,
            }
        )
    return spots


LOT = {
    "name": "parkpick 타워 주차장",
    "address": "서울특별시 강남구 테헤란로 123",
    "floors": [
        {"id": "B1", "label": "지하 1층", "zones": ["A", "B"]},
        {"id": "B2", "label": "지하 2층", "zones": ["A", "B"]},
    ],
    "spots": [
        *_make_spots("B1", "A", 20, 0.7),
        *_make_spots("B1", "B", 20, 0.55),
        *_make_spots("B2", "A", 20, 0.4),
        *_make_spots("B2", "B", 20, 0.3),
    ],
}

EVENTS = [
    {"id": 1, "type": "long_parking", "label": "장기 주차", "spot": "B2-A03", "floor": "B2", "level": "warning", "message": "48시간 이상 장기 주차 차량 감지", "time": "10:24:11", "resolved": False},
    {"id": 2, "type": "illegal", "label": "불법 주차", "spot": "B1-B12", "floor": "B1", "level": "critical", "message": "장애인 전용 구역 일반 차량 주차", "time": "10:18:42", "resolved": False},
    {"id": 3, "type": "wrong_way", "label": "역주행", "spot": "B1 진입로", "floor": "B1", "level": "critical", "message": "출차 방향 역주행 차량 추적 (Track #41)", "time": "09:52:03", "resolved": True},
    {"id": 4, "type": "congestion", "label": "혼잡", "spot": "B1 전체", "floor": "B1", "level": "info", "message": "B1층 점유율 90% 초과 — B2 유도 권장", "time": "09:30:00", "resolved": False},
]

VEHICLES = [
    {"plate": "12가 3456", "spot": "B1-A05", "floor": "B1", "enteredAt": "2026-11-25 08:42", "confidence": 0.97},
    {"plate": "34나 7890", "spot": "B2-B11", "floor": "B2", "enteredAt": "2026-11-25 09:15", "confidence": 0.94},
    {"plate": "56다 1234", "spot": "B1-B02", "floor": "B1", "enteredAt": "2026-11-25 10:03", "confidence": 0.91},
]

USERS = [
    {"id": 1, "name": "홍기흥", "email": "admin@parkpick.kr", "role": "admin", "joined": "2026-10-01"},
    {"id": 2, "name": "박미금", "email": "user@parkpick.kr", "role": "user", "joined": "2026-10-02"},
    {"id": 3, "name": "김모란", "email": "moran@parkpick.kr", "role": "user", "joined": "2026-10-05"},
    {"id": 4, "name": "이오리", "email": "iori@parkpick.kr", "role": "user", "joined": "2026-10-05"},
    {"id": 5, "name": "테스트관리자", "email": "test-admin@parkpick.kr", "role": "test_admin", "joined": "2026-11-20"},
]

STATS = {
    "kpi": {"totalSpots": 80, "occupied": 41, "occupancyRate": 51.3, "turnover": 2.4, "todayIn": 312, "todayOut": 287, "mAP": 0.912, "ocrRate": 0.958},
    "hourly": [
        {"hour": "06시", "occupancy": 12, "in": 8, "out": 2},
        {"hour": "07시", "occupancy": 28, "in": 34, "out": 5},
        {"hour": "08시", "occupancy": 51, "in": 62, "out": 9},
        {"hour": "09시", "occupancy": 68, "in": 48, "out": 15},
        {"hour": "10시", "occupancy": 74, "in": 30, "out": 22},
        {"hour": "11시", "occupancy": 76, "in": 24, "out": 19},
        {"hour": "12시", "occupancy": 70, "in": 18, "out": 31},
        {"hour": "13시", "occupancy": 72, "in": 26, "out": 24},
        {"hour": "14시", "occupancy": 69, "in": 21, "out": 23},
        {"hour": "15시", "occupancy": 65, "in": 17, "out": 20},
        {"hour": "16시", "occupancy": 61, "in": 15, "out": 18},
        {"hour": "17시", "occupancy": 54, "in": 12, "out": 26},
        {"hour": "18시", "occupancy": 40, "in": 9, "out": 38},
    ],
    "model": {"mAP50": 0.912, "mAP5095": 0.731, "ocrAccuracy": 0.958, "trackingMOTA": 0.874},
}

REPORTS = [
    {
        "id": 1,
        "title": "2026-11-24 일간 운영 리포트",
        "period": "daily",
        "createdAt": "2026-11-25 06:00",
        "summary": "전일 평균 점유율 58%, 피크 13시(82%). 장기 주차 1건, 불법 주차 2건 감지.",
        "body": "전일 평균 점유율은 58%로 전주 대비 4%p 상승했습니다. 피크 시간대는 13시(82%)이며, B1층 혼잡도가 지속적으로 높아 B2층 유도 배너 노출을 권장합니다. 이상 이벤트는 장기 주차 1건, 불법 주차 2건이 탐지되었고 모두 관제사 확인 조치되었습니다. 번호판 인식률 95.8%, 탐지 mAP@50 91.2%를 기록했습니다.",
    },
    {
        "id": 2,
        "title": "2026년 47주차 주간 운영 리포트",
        "period": "weekly",
        "createdAt": "2026-11-24 06:00",
        "summary": "주간 평균 점유율 54%, 회전율 2.1. 금요일 피크 패턴 뚜렷.",
        "body": "금주 평균 점유율 54%(전주 +2%p). 요일별로 금요일이 가장 혼잡(71%)했고 주말은 30%대로 안정적이었습니다. EV 충전 구역 회전율이 0.8로 낮아 충전 완료 차량 이동 안내 알림 도입을 제안합니다.",
    },
]

CAMERAS = [
    {"id": "CAM-B1-01", "name": "B1 A구역", "floor": "B1", "zone": "A"},
    {"id": "CAM-B1-02", "name": "B1 B구역", "floor": "B1", "zone": "B"},
    {"id": "CAM-B2-01", "name": "B2 A구역", "floor": "B2", "zone": "A"},
]

AUDIT_LOG: list[dict] = []


def audit(actor: str, action: str, detail: str = "") -> None:
    """관리자 주요 작업 감사 로그 (인메모리 → 프로덕션에서는 DB)."""
    AUDIT_LOG.append(
        {"actor": actor, "action": action, "detail": detail, "at": datetime.now().isoformat(timespec="seconds")}
    )


def next_event_id() -> int:
    return max((e["id"] for e in EVENTS), default=0) + 1


def occupancy_rate() -> float:
    occ = sum(1 for s in LOT["spots"] if s["status"] == "occupied")
    return round(occ / len(LOT["spots"]) * 100, 1)


def generate_report_body() -> dict:
    """Gemini 미설정 시 규칙 기반 리포트 (GEMINI_API_KEY 설정 시 LLM으로 대체)."""
    rate = occupancy_rate()
    open_events = [e for e in EVENTS if not e["resolved"]]
    return {
        "id": int(datetime.now().timestamp()),
        "title": f"{datetime.now().date()} 실시간 생성 리포트",
        "period": "on-demand",
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "summary": f"현재 점유율 {rate}%, 진행 중 이상 이벤트 {len(open_events)}건.",
        "body": (
            f"현재 시점 관제 데이터 기반 자동 생성 리포트입니다. 전체 {len(LOT['spots'])}면 중 "
            f"{sum(1 for s in LOT['spots'] if s['status'] == 'occupied')}면 점유({rate}%). "
            f"진행 중 이벤트 {len(open_events)}건 — 현장 확인을 권장합니다."
        ),
    }
