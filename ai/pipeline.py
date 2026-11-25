"""영상 추론 파이프라인.

사용법:
    python -m ai.pipeline --demo          # 영상 없이 시뮬레이션 실행
    python -m ai.pipeline <video.mp4>     # 실제 영상 파일 추론

탐지·추적·점유 판별 결과를 표준 출력으로 내보내며,
실제 환경에서는 backend/app/ws.py 매니저로 브로드캐스트합니다.
"""
import argparse
import json
import time

import numpy as np

from .inference.detector import Detector
from .inference.occupancy import judge_occupancy
from .inference.tracker import CentroidTracker

# 데모용 주차면 ROI (실제로는 관리자가 카메라별로 등록)
DEMO_SPOTS = [
    {"id": "B1-A01", "roi": [50, 100, 250, 220]},
    {"id": "B1-A02", "roi": [260, 100, 460, 220]},
    {"id": "B1-A03", "roi": [470, 100, 670, 220]},
]


def run_demo(frames: int = 10, interval: float = 0.5) -> None:
    detector = Detector()
    tracker = CentroidTracker()
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)

    mode = "YOLO 실제 추론" if detector.is_real else "시뮬레이션 탐지"
    print(f"[pipeline] mode={mode}, spots={len(DEMO_SPOTS)}")

    for i in range(frames):
        dets = tracker.update(detector.detect(frame))
        occupancy = judge_occupancy(DEMO_SPOTS, dets)
        payload = {
            "frame": i,
            "detections": [
                {"label": d["label"], "conf": d["conf"], "track_id": d["track_id"]} for d in dets
            ],
            "occupancy": occupancy,
        }
        print(json.dumps(payload, ensure_ascii=False))
        time.sleep(interval)


def run_video(path: str) -> None:
    import cv2  # noqa: PLC0415

    detector, tracker = Detector(), CentroidTracker()
    cap = cv2.VideoCapture(path)
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break
        dets = tracker.update(detector.detect(frame))
        print(json.dumps({"occupancy": judge_occupancy(DEMO_SPOTS, dets)}, ensure_ascii=False))
    cap.release()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("video", nargs="?", help="입력 영상 경로")
    parser.add_argument("--demo", action="store_true", help="시뮬레이션 모드")
    args = parser.parse_args()

    if args.demo or not args.video:
        run_demo()
    else:
        run_video(args.video)
