import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine, faUsers, faTriangleExclamation, faFileLines, faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend as ChartLegend,
} from 'recharts'
import KpiCard from '../../components/KpiCard.jsx'
import { useApi } from '../../hooks/useParking.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { api } from '../../api/client.js'

const TABS = [
  { id: 'dashboard', label: '모니터링 대시보드', icon: faChartLine },
  { id: 'members', label: '회원 관리', icon: faUsers },
  { id: 'events', label: '이벤트 관제', icon: faTriangleExclamation },
  { id: 'reports', label: 'AI 운영 리포트', icon: faFileLines },
]

const LEVEL_STYLE = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-sky-100 text-sky-700',
}

function Dashboard() {
  const { data: stats } = useApi('/api/stats')
  if (!stats) return <p className="text-sm text-slate-400">불러오는 중…</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="점유율" value={stats.kpi.occupancyRate} unit="%" />
        <KpiCard label="회전율" value={stats.kpi.turnover} />
        <KpiCard label="mAP@50" value={(stats.model.mAP50 * 100).toFixed(1)} unit="%" sub={`mAP@50-95 ${(stats.model.mAP5095 * 100).toFixed(1)}%`} />
        <KpiCard label="번호판 인식률" value={(stats.model.ocrAccuracy * 100).toFixed(1)} unit="%" sub={`추적 MOTA ${(stats.model.trackingMOTA * 100).toFixed(1)}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700">시간대별 점유율 (%)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="occupancy" stroke="#3b5bff" strokeWidth={2.5} dot={false} name="점유율" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700">시간대별 입·출차 (대)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <ChartLegend />
              <Bar dataKey="in" fill="#22c55e" name="입차" radius={[3, 3, 0, 0]} />
              <Bar dataKey="out" fill="#ef4444" name="출차" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Members({ readOnly }) {
  const { data: users, reload } = useApi('/api/admin/users')
  const { toast } = useToast()

  const changeRole = async (u, role) => {
    if (readOnly) return toast('테스트 관리자 계정은 읽기 전용입니다', 'warn')
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: { role } })
      toast(`${u.name}님 권한이 변경되었습니다`)
      reload()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
          <tr>
            <th className="px-5 py-3">이름</th>
            <th className="px-5 py-3">이메일</th>
            <th className="px-5 py-3">권한</th>
            <th className="px-5 py-3">가입일</th>
            <th className="px-5 py-3 text-right">권한 변경</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users?.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-medium">{u.name}</td>
              <td className="px-5 py-3 text-slate-500">{u.email}</td>
              <td className="px-5 py-3">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                  u.role === 'admin' ? 'bg-brand-100 text-brand-700' : u.role === 'test_admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {u.role === 'admin' ? '관리자' : u.role === 'test_admin' ? '테스트 관리자' : '일반'}
                </span>
              </td>
              <td className="px-5 py-3 text-slate-500">{u.joined}</td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => changeRole(u, u.role === 'admin' ? 'user' : 'admin')}
                  disabled={readOnly}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {u.role === 'admin' ? '일반으로 변경' : '관리자로 승격'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Events({ readOnly }) {
  const { data: events, reload } = useApi('/api/events')
  const { toast } = useToast()

  const resolve = async (e) => {
    if (readOnly) return toast('테스트 관리자 계정은 읽기 전용입니다', 'warn')
    try {
      await api(`/api/events/${e.id}`, { method: 'PATCH', body: { resolved: true } })
      toast('이벤트가 처리 완료되었습니다')
      reload()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-3">
      {events?.map((e) => (
        <div key={e.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${LEVEL_STYLE[e.level]}`}>{e.label}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800">{e.message}</p>
            <p className="text-xs text-slate-400">{e.spot} · {e.time}</p>
          </div>
          {e.resolved ? (
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">처리완료</span>
          ) : (
            <button
              onClick={() => resolve(e)} disabled={readOnly}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              처리 완료
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function Reports({ readOnly }) {
  const { data: reports, reload } = useApi('/api/reports')
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    if (readOnly) return toast('테스트 관리자 계정은 읽기 전용입니다', 'warn')
    setBusy(true)
    try {
      await api('/api/reports/generate', { method: 'POST' })
      toast('AI 운영 리포트가 생성되었습니다')
      reload()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        onClick={generate} disabled={readOnly || busy}
        className="mb-5 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} /> Gemini 리포트 생성
      </button>
      <div className="space-y-3">
        {reports?.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{r.title}</h3>
              <span className="text-xs text-slate-400">{r.createdAt}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{r.summary}</p>
            <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const readOnly = user?.role === 'test_admin'
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-800">관리자 대시보드</h1>
        {readOnly && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            TEST ADMIN · 읽기 전용
          </span>
        )}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FontAwesomeIcon icon={t.icon} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'members' && <Members readOnly={readOnly} />}
        {tab === 'events' && <Events readOnly={readOnly} />}
        {tab === 'reports' && <Reports readOnly={readOnly} />}
      </div>
    </div>
  )
}
