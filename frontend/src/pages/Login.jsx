import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareParking, faUserCheck, faUserShield, faKey } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faN, faComment } from './socialIcons.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

// 비밀번호: 영문 대소문자+숫자+특수문자 조합 8자 이상
const PW_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

export default function Login() {
  const { login, loginTest, loginAdmin, loginOAuth } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminMode, setAdminMode] = useState(false)
  const [adminSecret, setAdminSecret] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const pwValid = PW_RULE.test(password)

  const go = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
      navigate(from, { replace: true })
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다')
    } finally {
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!pwValid) {
      setError('비밀번호는 영문 대소문자·숫자·특수문자 조합 8자 이상이어야 합니다')
      return
    }
    go(() => login(email, password))
  }

  const oauth = (provider) =>
    go(() => loginOAuth(provider)).catch(() => toast('소셜 로그인 준비 중입니다', 'warn'))

  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜드 그래픽 */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-ink-800 to-brand-700 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <FontAwesomeIcon icon={faSquareParking} className="text-xl" />
          </span>
          <span className="font-display text-2xl font-bold">parkpick</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-snug">
            이동체 영상 데이터 기반<br />AI 주차관제 플랫폼
          </h2>
          <p className="mt-4 max-w-md text-brand-100">
            YOLO 객체 탐지 · ByteTrack 추적 · 번호판 OCR로 주차면 점유를 실시간 판별하고,
            관제 대시보드와 주차 유도를 제공합니다.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['mAP@50', '91.2%'], ['번호판 인식', '95.8%'], ['실시간 관제', 'WebSocket']].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/10 p-4">
                <div className="font-display text-lg font-bold">{v}</div>
                <div className="mt-1 text-xs text-brand-100">{k}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">© 2026 parkpick. AI Hub K-AI 데이터셋 기반 데모.</p>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <FontAwesomeIcon icon={faSquareParking} />
            </span>
            <span className="font-display text-xl font-bold text-brand-900">parkpick</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-slate-800">
            {adminMode ? '관리자 로그인' : '로그인'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {adminMode ? '.env에 설정된 관리자 보안 키를 입력하세요' : 'parkpick 관제 플랫폼에 오신 것을 환영합니다'}
          </p>

          {!adminMode ? (
            <>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">이메일</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.kr"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">비밀번호</label>
                  <input
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="영문 대소문자·숫자·특수문자 조합 8자 이상"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  {password && !pwValid && (
                    <p className="mt-1 text-xs text-red-500">대소문자·숫자·특수문자 조합 8자 이상이 필요합니다</p>
                  )}
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                <button
                  type="submit" disabled={busy}
                  className="w-full rounded-lg bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  로그인
                </button>
              </form>

              {/* 테스트 계정 간편 로그인 */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => go(() => loginTest('user'))} disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-600"
                >
                  <FontAwesomeIcon icon={faUserCheck} /> 일반 사용자
                </button>
                <button
                  onClick={() => go(() => loginTest('test_admin'))} disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                >
                  <FontAwesomeIcon icon={faUserShield} /> 테스트 관리자
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">테스트 관리자는 읽기 전용(조회만 가능)입니다</p>

              {/* 소셜 로그인 */}
              <div className="mt-6">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />소셜 로그인<span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button onClick={() => oauth('google')} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm hover:bg-slate-50">
                    <FontAwesomeIcon icon={faGoogle} className="text-[#ea4335]" /> Google
                  </button>
                  <button onClick={() => oauth('naver')} className="flex items-center justify-center gap-2 rounded-lg bg-[#03c75a] py-2.5 text-sm font-bold text-white hover:brightness-95">
                    <FontAwesomeIcon icon={faN} /> Naver
                  </button>
                  <button onClick={() => oauth('kakao')} className="flex items-center justify-center gap-2 rounded-lg bg-[#fee500] py-2.5 text-sm font-bold text-[#3c1e1e] hover:brightness-95">
                    <FontAwesomeIcon icon={faComment} /> Kakao
                  </button>
                </div>
              </div>

              <button onClick={() => setAdminMode(true)} className="mt-8 flex w-full items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600">
                <FontAwesomeIcon icon={faKey} /> 관리자 보안 키로 로그인
              </button>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); go(() => loginAdmin(adminSecret)) }} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">관리자 보안 키 (ADMIN_SECRET_KEY)</label>
                <input
                  type="password" required value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="환경 변수에 등록된 보안 키"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <p className="mt-1 text-xs text-slate-400">데모에서는 아무 키(4자 이상)나 입력하면 됩니다</p>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-lg bg-ink-800 py-3 text-sm font-bold text-white hover:bg-ink-700 disabled:opacity-50">
                관리자 로그인
              </button>
              <button type="button" onClick={() => setAdminMode(false)} className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
                ← 일반 로그인으로 돌아가기
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
