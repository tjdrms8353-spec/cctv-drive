# data/ — 데이터셋·분석 산출물 (이오리)

| 경로 | 내용 | Git |
|------|------|-----|
| `parking_lot.sample.json` | 데모 주차장 구조·ROI·샘플 차량 데이터 | 포함 |
| `raw/` `videos/` | AI Hub 원본 영상·라벨링 데이터 | 제외 (`.gitignore`) |
| `*.pt` `*.onnx` | 학습된 모델 가중치 | 제외 → 클라우드 버킷 |

- 원본 데이터셋: AI Hub "주차 관련 이동체 인지 영상" 등 K-AI 데이터셋
- 공공데이터: 공공데이터포털 주차장 정보 API (`PUBLIC_DATA_API_KEY`)
- 분석 스크립트(점유율·회전율·혼잡도): pandas/NumPy 기반, `docs/산출물/데이터_분석_보고서`에 결과 정리
