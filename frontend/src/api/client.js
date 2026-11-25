// ============================================================
// API 클라이언트 — 실제 백엔드 연동 + Mock 데모 폴백
// VITE_API_URL이 없거나 요청이 실패하면 데모 모드(Mock 데이터)로 동작합니다.
// ============================================================
import {
  MOCK_LOT, MOCK_EVENTS, MOCK_VEHICLES, MOCK_USERS, MOCK_STATS, MOCK_REPORTS, MOCK_CAMERAS,
} from './mock.js'

export const API_URL = import.meta.env.VITE_API_URL || ''
export const WS_URL = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws')
export const isDemo = !API_URL

const wait = (ms = 180) => new Promise((r) => setTimeout(r, ms))

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('parkpick_user'))
  } catch {
    return null
  }
}

// ---------- 실제 백엔드 ----------
async function realApi(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new ApiError(res.status, detail.detail || `요청 실패 (${res.status})`)
  }
  return res.json()
}

// ---------- 데모 모드 Mock 라우터 ----------
const demoState = {
  lot: structuredClone(MOCK_LOT),
  events: structuredClone(MOCK_EVENTS),
  users: structuredClone(MOCK_USERS),
  reports: structuredClone(MOCK_REPORTS),
}

function guardWrite(session) {
  if (session?.role === 'test_admin') {
    throw new ApiError(403, '테스트 관리자 계정은 읽기 전용입니다')
  }
}

async function mockApi(path, { method = 'GET', body, token } = {}) {
  await wait()
  const session = getSession()

  // 인증
  if (path === '/api/auth/login' && method === 'POST') {
    return { token: `demo.user.${Date.now()}`, user: { name: '데모 사용자', email: body.email, role: 'user' } }
  }
  if (path === '/api/auth/test-login' && method === 'POST') {
    const role = body.role === 'test_admin' ? 'test_admin' : 'user'
    return {
      token: `demo.${role}.${Date.now()}`,
      user: role === 'test_admin'
        ? { name: '테스트 관리자', email: 'test-admin@parkpick.kr', role }
        : { name: '테스트 사용자', email: 'user@parkpick.kr', role },
    }
  }
  if (path === '/api/auth/admin-login' && method === 'POST') {
    if (!body.secret || body.secret.length < 4) throw new ApiError(401, '관리자 보안 키가 올바르지 않습니다')
    return { token: `demo.admin.${Date.now()}`, user: { name: '관리자', email: 'admin@parkpick.kr', role: 'admin' } }
  }
  if (path.startsWith('/api/auth/oauth/')) {
    const provider = path.split('/').pop()
    return { token: `demo.oauth.${provider}.${Date.now()}`, user: { name: `${provider} 사용자`, email: `${provider}@oauth.demo`, role: 'user' } }
  }

  // 주차 데이터
  if (path === '/api/parking/lot') return demoState.lot
  if (path === '/api/parking/cameras') return MOCK_CAMERAS
  if (path === '/api/stats') return MOCK_STATS
  if (path === '/api/events') return demoState.events
  if (path === '/api/reports') return demoState.reports
  if (path === '/api/admin/users') return demoState.users

  if (path.startsWith('/api/parking/recommend')) {
    const params = new URLSearchParams(path.split('?')[1] || '')
    const type = params.get('type') || 'normal'
    const floor = params.get('floor')
    const free = demoState.lot.spots.filter(
      (s) => s.status === 'free' && (type === 'normal' ? s.type === 'normal' : s.type === type)
        && (!floor || s.floor === floor),
    )
    if (!free.length) throw new ApiError(404, '조건에 맞는 빈 주차면이 없습니다')
    return { spot: free[Math.floor(Math.random() * free.length)], etaSec: 40 + Math.floor(Math.random() * 80) }
  }

  if (path.startsWith('/api/vehicles/')) {
    const plate = decodeURIComponent(path.split('/').pop()).replace(/\s/g, '')
    const v = MOCK_VEHICLES.find((x) => x.plate.replace(/\s/g, '') === plate)
    if (!v) throw new ApiError(404, '해당 번호의 차량이 인식되지 않았습니다')
    return v
  }

  // 쓰기 요청 — 테스트 관리자 차단(백엔드와 동일 규칙)
  if (method !== 'GET') guardWrite(session)

  if (path === '/api/reports/generate' && method === 'POST') {
    const report = {
      id: Date.now(),
      title: `${new Date().toISOString().slice(0, 10)} 실시간 생성 리포트`,
      period: 'on-demand',
      createdAt: new Date().toLocaleString('ko-KR'),
      summary: '현재 점유율 51%, 이상 이벤트 2건 진행 중. B1층 혼잡도 상승 추세.',
      body: '현재 시점 데이터를 기반으로 생성된 리포트입니다. 전체 80면 중 41면 점유(51.3%). 장기 주차 1건과 장애인 구역 불법 주차 1건이 진행 중이며 즉각적인 현장 확인을 권장합니다.',
    }
    demoState.reports = [report, ...demoState.reports]
    return report
  }

  if (path.startsWith('/api/events/') && method === 'PATCH') {
    const id = Number(path.split('/').pop())
    demoState.events = demoState.events.map((e) => (e.id === id ? { ...e, ...body } : e))
    return demoState.events.find((e) => e.id === id)
  }

  if (path.startsWith('/api/admin/users/') && method === 'PATCH') {
    const id = Number(path.split('/').pop())
    demoState.users = demoState.users.map((u) => (u.id === id ? { ...u, ...body } : u))
    return demoState.users.find((u) => u.id === id)
  }

  throw new ApiError(404, `Unknown endpoint: ${path}`)
}

// ---------- 공통 인터페이스 ----------
export async function api(path, opts = {}) {
  if (isDemo) return mockApi(path, opts)
  try {
    return await realApi(path, opts)
  } catch (err) {
    if (err instanceof ApiError) throw err
    // 네트워크 실패 → 데모 폴백 (API 다운 시에도 화면 유지)
    console.warn('[parkpick] API 연결 실패, 데모 데이터로 대체합니다:', err.message)
    return mockApi(path, opts)
  }
}

// ---------- 실시간 구독 (WebSocket 또는 Mock 시뮬레이터) ----------
export function subscribeParking(onLot, onEvent) {
  if (!isDemo && WS_URL) {
    const ws = new WebSocket(`${WS_URL}/ws/parking`)
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      if (data.type === 'lot') onLot?.(data.payload)
      if (data.type === 'event') onEvent?.(data.payload)
    }
    return () => ws.close()
  }

  // 데모 시뮬레이터: 3초 간격으로 주차면 상태를 무작위 갱신
  const timer = setInterval(() => {
    const spots = demoState.lot.spots
    const target = spots[Math.floor(Math.random() * spots.length)]
    target.status = target.status === 'free' ? 'occupied' : 'free'
    if (target.status === 'occupied') {
      target.plate = `${10 + Math.floor(Math.random() * 80)}하 ${1000 + Math.floor(Math.random() * 8999)}`
      target.since = new Date().toTimeString().slice(0, 5)
    } else {
      target.plate = null
      target.since = null
    }
    onLot?.({ ...demoState.lot, spots: [...spots] })
    if (Math.random() < 0.08) {
      onEvent?.({
        id: Date.now(),
        type: 'congestion',
        label: '혼잡',
        spot: `${target.floor}-${target.zone}`,
        floor: target.floor,
        level: 'info',
        message: `${target.id} 구역 점유 상태 변경 감지`,
        time: new Date().toTimeString().slice(0, 8),
        resolved: false,
      })
    }
  }, 3000)
  return () => clearInterval(timer)
}
