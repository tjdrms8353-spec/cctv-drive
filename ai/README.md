# ai/ — 이동체 탐지·추적·점유 판별 파이프라인 (김모란)

K-AI 데이터셋(주차 관련 이동체 인지 영상) 기반 Computer Vision 모듈입니다.

## 구조

```
inference/
  detector.py    YOLO 객체 탐지 (ultralytics, 미설치 시 시뮬레이션 탐지)
  tracker.py     중심점 기반 이동체 추적 (ByteTrack/DeepSORT 경량 대체)
  occupancy.py   ROI(주차면 영역) ↔ 탐지 박스 IoU로 점유 판별
  ocr.py         번호판 OCR (EasyOCR/PaddleOCR, 미설치 시 스텁)
pipeline.py      영상 → 탐지·추적·점유판별 → 백엔드 이벤트 전송
```

## 데모 실행

```bash
python -m ai.pipeline --demo        # 영상 없이 시뮬레이션 탐지
python -m ai.pipeline video.mp4     # 실제 영상 추론 (ultralytics 필요)
```

## 학습 (로컬 GPU 환경)

1. AI Hub '주차 관련 이동체 인지 영상' 다운로드 → `data/raw/` (git 제외)
2. 라벨 JSON → YOLO 포맷 변환 (`scripts/convert_labels.py` 예정)
3. `yolo train data=parking.yaml model=yolov8n.pt epochs=50`
4. 가중치 `*.pt` → 클라우드 버킷 관리 (`YOLO_WEIGHTS` 환경 변수)

성능 목표: mAP@50 ≥ 0.90, 번호판 OCR 정확도 ≥ 0.95, 추적 MOTA ≥ 0.85
