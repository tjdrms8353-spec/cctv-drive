"""경량 중심점 추적기.

데모/CI 환경에서 ByteTrack·DeepSORT 대신 사용하는
중심점 거리 기반 트래커입니다. 프로덕션에서는
ultralytics의 `model.track(persist=True, tracker="bytetrack.yaml")`로 대체합니다.
"""


def _centroid(bbox: list[float]) -> tuple[float, float]:
    return ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)


class CentroidTracker:
    def __init__(self, max_dist: float = 80.0) -> None:
        self.max_dist = max_dist
        self.tracks: dict[int, tuple[float, float]] = {}
        self.next_id = 1

    def update(self, detections: list[dict]) -> list[dict]:
        """각 탐지에 track_id를 부여해 반환."""
        assigned = {}
        used = set()
        for det in detections:
            c = _centroid(det["bbox"])
            best, best_d = None, self.max_dist
            for tid, tc in self.tracks.items():
                if tid in used:
                    continue
                d = ((c[0] - tc[0]) ** 2 + (c[1] - tc[1]) ** 2) ** 0.5
                if d < best_d:
                    best, best_d = tid, d
            if best is None:
                best = self.next_id
                self.next_id += 1
            assigned[id(det)] = best
            used.add(best)
            det["track_id"] = best
        self.tracks = {assigned[id(d)]: _centroid(d["bbox"]) for d in detections}
        return detections
