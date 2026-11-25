"""YOLO 객체 탐지 래퍼.

ultralytics 설치 + YOLO_WEIGHTS 가중치가 있으면 실제 추론,
없으면 데모용 시뮬레이션 탐지를 반환합니다.
"""
import os
import random

CONF = float(os.getenv("DETECT_CONFIDENCE", "0.45"))
WEIGHTS = os.getenv("YOLO_WEIGHTS", "ai/weights/best.pt")

CLASSES = {0: "car", 1: "person", 2: "bike", 3: "truck"}


class Detector:
    def __init__(self) -> None:
        self.model = None
        try:
            from ultralytics import YOLO  # noqa: PLC0415

            if os.path.exists(WEIGHTS):
                self.model = YOLO(WEIGHTS)
        except ImportError:
            pass

    @property
    def is_real(self) -> bool:
        return self.model is not None

    def detect(self, frame) -> list[dict]:
        """→ [{cls, label, conf, bbox:[x1,y1,x2,y2]}]"""
        if self.model is not None:
            results = self.model(frame, conf=CONF, verbose=False)[0]
            return [
                {
                    "cls": int(b.cls),
                    "label": CLASSES.get(int(b.cls), "object"),
                    "conf": float(b.conf),
                    "bbox": [round(v, 1) for v in b.xyxy[0].tolist()],
                }
                for b in results.boxes
            ]
        return self._simulate(frame)

    def _simulate(self, frame) -> list[dict]:
        h, w = frame.shape[:2] if hasattr(frame, "shape") else (720, 1280)
        out = []
        for _ in range(random.randint(1, 4)):
            bw, bh = random.randint(80, 200), random.randint(50, 120)
            x1 = random.randint(0, max(1, w - bw))
            y1 = random.randint(0, max(1, h - bh))
            cls = random.choices([0, 1, 2], weights=[7, 2, 1])[0]
            out.append(
                {
                    "cls": cls,
                    "label": CLASSES[cls],
                    "conf": round(random.uniform(0.5, 0.98), 2),
                    "bbox": [x1, y1, x1 + bw, y1 + bh],
                }
            )
        return out
