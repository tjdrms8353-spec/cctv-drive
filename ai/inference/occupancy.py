"""주차면 점유 판별 — ROI(주차면 영역)와 차량 탐지 박스의 IoU 계산."""


def iou(a: list[float], b: list[float]) -> float:
    ix1, iy1 = max(a[0], b[0]), max(a[1], b[1])
    ix2, iy2 = min(a[2], b[2]), min(a[3], b[3])
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    if inter == 0:
        return 0.0
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return inter / (area_a + area_b - inter)


VEHICLE_CLASSES = {"car", "truck", "bike"}


def judge_occupancy(spots: list[dict], detections: list[dict], threshold: float = 0.25) -> dict[str, str]:
    """spot['roi'] = [x1,y1,x2,y2] 기준 점유 상태 반환 → {spot_id: 'occupied'|'free'}"""
    vehicles = [d for d in detections if d["label"] in VEHICLE_CLASSES]
    result = {}
    for spot in spots:
        roi = spot["roi"]
        occupied = any(iou(roi, v["bbox"]) >= threshold for v in vehicles)
        result[spot["id"]] = "occupied" if occupied else "free"
    return result
