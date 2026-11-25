// ============================================================
// parkpick 데모용 Mock 데이터
// 백엔드(backend/app/data.py)와 동일한 스키마를 유지합니다.
// 백엔드 미연결 시(VITE_API_URL 없음) 이 데이터로 전체 화면이 동작합니다.
// ============================================================

const TYPES = ['normal', 'disabled', 'ev', 'reserved']

function makeSpots(floor, zone, count, occupiedRatio) {
  const spots = []
  for (let i = 1; i <= count; i++) {
    let type = 'normal'
    if (i % 15 === 0) type = 'disabled'
    else if (i % 11 === 0) type = 'ev'
    else if (i % 17 === 0) type = 'reserved'
    const status = Math.random() < occupiedRatio ? 'occupied' : 'free'
    spots.push({
      id: `${floor}-${zone}${String(i).padStart(2, '0')}`,
      floor,
      zone,
      num: i,
      type,
      status,
      plate: status === 'occupied' ? `${10 + i}가 ${1000 + i * 7}` : null,
      since: status === 'occupied' ? `2026-11-25 0${8 + (i % 3)}:${String(10 + i).slice(-2)}` : null,
    })
  }
  return spots
}

export const MOCK_LOT = {
  name: 'parkpick 타워 주차장',
  address: '서울특별시 강남구 테헤란로 123',
  floors: [
    { id: 'B1', label: '지하 1층', zones: ['A', 'B'] },
    { id: 'B2', label: '지하 2층', zones: ['A', 'B'] },
  ],
  spots: [
    ...makeSpots('B1', 'A', 20, 0.7),
    ...makeSpots('B1', 'B', 20, 0.55),
    ...makeSpots('B2', 'A', 20, 0.4),
    ...makeSpots('B2', 'B', 20, 0.3),
  ],
}

export const MOCK_EVENTS = [
  { id: 1, type: 'long_parking', label: '장기 주차', spot: 'B2-A03', floor: 'B2', level: 'warning', message: '48시간 이상 장기 주차 차량 감지', time: '10:24:11', resolved: false },
  { id: 2, type: 'illegal', label: '불법 주차', spot: 'B1-B12', floor: 'B1', level: 'critical', message: '장애인 전용 구역 일반 차량 주차', time: '10:18:42', resolved: false },
  { id: 3, type: 'wrong_way', label: '역주행', spot: 'B1 진입로', floor: 'B1', level: 'critical', message: '출차 방향 역주행 차량 추적 (Track #41)', time: '09:52:03', resolved: true },
  { id: 4, type: 'congestion', label: '혼잡', spot: 'B1 전체', floor: 'B1', level: 'info', message: 'B1층 점유율 90% 초과 — B2 유도 권장', time: '09:30:00', resolved: false },
]

export const MOCK_VEHICLES = [
  { plate: '12가 3456', spot: 'B1-A05', floor: 'B1', enteredAt: '2026-11-25 08:42', confidence: 0.97 },
  { plate: '34나 7890', spot: 'B2-B11', floor: 'B2', enteredAt: '2026-11-25 09:15', confidence: 0.94 },
  { plate: '56다 1234', spot: 'B1-B02', floor: 'B1', enteredAt: '2026-11-25 10:03', confidence: 0.91 },
]

export const MOCK_USERS = [
  { id: 1, name: '홍기흥', email: 'admin@parkpick.kr', role: 'admin', joined: '2026-10-01' },
  { id: 2, name: '박미금', email: 'user@parkpick.kr', role: 'user', joined: '2026-10-02' },
  { id: 3, name: '김모란', email: 'moran@parkpick.kr', role: 'user', joined: '2026-10-05' },
  { id: 4, name: '이오리', email: 'iori@parkpick.kr', role: 'user', joined: '2026-10-05' },
  { id: 5, name: '테스트관리자', email: 'test-admin@parkpick.kr', role: 'test_admin', joined: '2026-11-20' },
]

export const MOCK_STATS = {
  kpi: { totalSpots: 80, occupied: 41, occupancyRate: 51.3, turnover: 2.4, todayIn: 312, todayOut: 287, mAP: 0.912, ocrRate: 0.958 },
  hourly: [
    { hour: '06시', occupancy: 12, in: 8, out: 2 },
    { hour: '07시', occupancy: 28, in: 34, out: 5 },
    { hour: '08시', occupancy: 51, in: 62, out: 9 },
    { hour: '09시', occupancy: 68, in: 48, out: 15 },
    { hour: '10시', occupancy: 74, in: 30, out: 22 },
    { hour: '11시', occupancy: 76, in: 24, out: 19 },
    { hour: '12시', occupancy: 70, in: 18, out: 31 },
    { hour: '13시', occupancy: 72, in: 26, out: 24 },
    { hour: '14시', occupancy: 69, in: 21, out: 23 },
    { hour: '15시', occupancy: 65, in: 17, out: 20 },
    { hour: '16시', occupancy: 61, in: 15, out: 18 },
    { hour: '17시', occupancy: 54, in: 12, out: 26 },
    { hour: '18시', occupancy: 40, in: 9, out: 38 },
  ],
  model: { mAP50: 0.912, mAP5095: 0.731, ocrAccuracy: 0.958, trackingMOTA: 0.874 },
}

export const MOCK_REPORTS = [
  {
    id: 1,
    title: '2026-11-24 일간 운영 리포트',
    period: 'daily',
    createdAt: '2026-11-25 06:00',
    summary: '전일 평균 점유율 58%, 피크 13시(82%). 장기 주차 1건, 불법 주차 2건 감지.',
    body: '전일 평균 점유율은 58%로 전주 대비 4%p 상승했습니다. 피크 시간대는 13시(82%)이며, B1층 혼잡도가 지속적으로 높아 B2층 유도 배너 노출을 권장합니다. 이상 이벤트는 장기 주차 1건, 불법 주차 2건이 탐지되었고 모두 관제사 확인 조치되었습니다. 번호판 인식률 95.8%, 탐지 mAP@50 91.2%를 기록했습니다.',
  },
  {
    id: 2,
    title: '2026년 47주차 주간 운영 리포트',
    period: 'weekly',
    createdAt: '2026-11-24 06:00',
    summary: '주간 평균 점유율 54%, 회전율 2.1. 금요일 피크 패턴 뚜렷.',
    body: '금주 평균 점유율 54%(전주 +2%p). 요일별로 금요일이 가장 혼잡(71%)했고 주말은 30%대로 안정적이었습니다. EV 충전 구역 회전율이 0.8로 낮아 충전 완료 차량 이동 안내 알림 도입을 제안합니다.',
  },
]

export const MOCK_CAMERAS = [
  { id: 'CAM-B1-01', name: 'B1 A구역', floor: 'B1', zone: 'A' },
  { id: 'CAM-B1-02', name: 'B1 B구역', floor: 'B1', zone: 'B' },
  { id: 'CAM-B2-01', name: 'B2 A구역', floor: 'B2', zone: 'A' },
]
