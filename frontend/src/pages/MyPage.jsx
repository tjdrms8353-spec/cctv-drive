import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCarSide, faClockRotateLeft, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext.jsx'
import { MOCK_VEHICLES } from '../api/mock.js'

const ROLE_LABEL = { user: '일반 사용자', admin: '관리자', test_admin: '테스트 관리자 (읽기 전용)' }

export default function MyPage() {
  const { user } = useAuth()
  const myCar = MOCK_VEHICLES[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800">마이페이지</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl text-brand-600">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <div>
              <h2 className="font-bold text-slate-800">{user?.name}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <FontAwesomeIcon icon={faShieldHalved} className="text-brand-500" />
            권한: <strong>{ROLE_LABEL[user?.role] ?? user?.role}</strong>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <FontAwesomeIcon icon={faCarSide} className="text-brand-500" /> 등록 차량
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">차량 번호</dt><dd className="font-semibold">{myCar.plate}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">현재 위치</dt><dd className="font-semibold text-brand-600">{myCar.spot}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">입차 시각</dt><dd className="font-semibold">{myCar.enteredAt}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-brand-500" /> 최근 이용 내역
          </h2>
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {[
              ['2026-11-25 08:42', '입차', 'B1-A05'],
              ['2026-11-24 18:20', '출차', 'B1-A05 · 주차 9시간 12분'],
              ['2026-11-24 09:05', '입차', 'B2-B11'],
            ].map(([t, kind, desc], i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <span className="text-slate-500">{t}</span>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${kind === '입차' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {kind}
                </span>
                <span className="text-slate-600">{desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
