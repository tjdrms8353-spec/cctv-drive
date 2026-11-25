"""주차 현황 / 유도 / 차량 조회 API."""
import random

from fastapi import APIRouter, Depends, HTTPException, Query

from .. import data
from ..auth import current_user

router = APIRouter(prefix="/api", tags=["parking"])


@router.get("/parking/lot")
def get_lot():
    return data.LOT


@router.get("/parking/cameras")
def get_cameras():
    return data.CAMERAS


@router.get("/parking/recommend", dependencies=[Depends(current_user)])
def recommend(
    type: str = Query("normal", pattern="^(normal|disabled|ev|reserved)$"),
    floor: str | None = None,
):
    free = [
        s
        for s in data.LOT["spots"]
        if s["status"] == "free"
        and (type == "normal" or s["type"] == type)
        and (type != "normal" or s["type"] == "normal")
        and (floor is None or s["floor"] == floor)
    ]
    if not free:
        raise HTTPException(404, "조건에 맞는 빈 주차면이 없습니다")
    return {"spot": random.choice(free), "etaSec": 40 + random.randint(0, 80)}


@router.get("/vehicles/{plate}", dependencies=[Depends(current_user)])
def find_vehicle(plate: str):
    normalized = plate.replace(" ", "")
    vehicle = next((v for v in data.VEHICLES if v["plate"].replace(" ", "") == normalized), None)
    if vehicle is None:
        raise HTTPException(404, "해당 번호의 차량이 인식되지 않았습니다")
    return vehicle
