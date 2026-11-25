import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// 카드형 지표 (KPI Card) — 대시보드 공통
export default function KpiCard({ icon, label, value, unit, sub, dark = false, accent = 'text-brand-600' }) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${
        dark ? 'border-ink-700 bg-ink-800' : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        {icon && <FontAwesomeIcon icon={icon} className={dark ? 'text-slate-500' : 'text-slate-300'} />}
      </div>
      <div className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${dark ? 'text-white' : accent}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium">{unit}</span>}
      </div>
      {sub && <div className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  )
}
