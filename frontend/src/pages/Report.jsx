import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileLines, faCalendarDay, faCalendarWeek, faBolt } from '@fortawesome/free-solid-svg-icons'
import { useApi } from '../hooks/useParking.js'

const PERIOD = {
  daily: { label: '일간', icon: faCalendarDay },
  weekly: { label: '주간', icon: faCalendarWeek },
  'on-demand': { label: '실시간', icon: faBolt },
}

export default function Report() {
  const { data: reports, loading } = useApi('/api/reports')
  const [openId, setOpenId] = useState(null)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800">AI 운영 리포트</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gemini AI가 관제 데이터를 분석해 자동 생성한 주차장 운영 리포트입니다
      </p>

      <div className="mt-8 space-y-4">
        {loading && <p className="text-sm text-slate-400">불러오는 중…</p>}
        {reports?.map((r) => {
          const meta = PERIOD[r.period] ?? PERIOD.daily
          const open = openId === r.id
          return (
            <article key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="flex w-full items-center gap-4 p-5 text-left hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FontAwesomeIcon icon={faFileLines} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                      <FontAwesomeIcon icon={meta.icon} className="mr-1" />{meta.label}
                    </span>
                    <span className="text-xs text-slate-400">{r.createdAt}</span>
                  </div>
                  <h2 className="mt-1.5 truncate font-bold text-slate-800">{r.title}</h2>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{r.summary}</p>
                </div>
                <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {open && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{r.body}</p>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
