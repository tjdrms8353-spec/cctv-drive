import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faVideo, faRoute, faCarSide, faChartLine, faCar, faPercent, faRobot,
} from '@fortawesome/free-solid-svg-icons'
import KpiCard from '../components/KpiCard.jsx'
import { useApi } from '../hooks/useParking.js'

const FEATURES = [
  { to: '/monitor', icon: faVideo, title: '실시간 관제', desc: 'CCTV 영상 AI 분석으로 주차면 점유 현황과 이상 이벤트를 실시간 모니터링합니다.' },
  { to: '/guide', icon: faRoute, title: '주차 유도', desc: '가장 가까운 빈 주차면을 추천하고 진입 경로를 안내합니다.' },
  { to: '/find-car', icon: faCarSide, title: '내 차 찾기', desc: '번호판 OCR로 인식된 차량의 주차 위치를 조회합니다.' },
  { to: '/report', icon: faChartLine, title: '운영 리포트', desc: 'Gemini AI가 점유율·회전율·혼잡도를 분석한 운영 리포트를 제공합니다.' },
]

export default function Home() {
  const { data: stats } = useApi('/api/stats')

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <FontAwesomeIcon icon={faRobot} /> AI Hub K-AI 이동체 인지 영상 기반
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              AI가 보는 주차장,<br />parkpick
            </h1>
            <p className="mt-5 text-base leading-relaxed text-brand-100 sm:text-lg">
              주차장 CCTV 영상을 YOLO 객체 탐지·추적 모델로 분석해 차량과 보행자를 실시간 인식하고,
              빈 주차면까지 스마트하게 유도하는 B2B 주차관제 솔루션입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/monitor" className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
                실시간 관제 시작
              </Link>
              <Link to="/login" className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                데모 로그인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 실시간 현황 요약 */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="font-display text-2xl font-bold text-slate-800">실시간 주차 현황</h2>
        <p className="mt-1 text-sm text-slate-500">parkpick 타워 주차장 · AI 탐지 기준</p>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={faCar} label="전체 주차면" value={stats?.kpi.totalSpots ?? '—'} unit="면" sub="지하 1~2층, A/B 구역" />
          <KpiCard icon={faPercent} label="현재 점유율" value={stats?.kpi.occupancyRate ?? '—'} unit="%" sub={`점유 ${stats?.kpi.occupied ?? '—'}면`} />
          <KpiCard icon={faChartLine} label="오늘 회전율" value={stats?.kpi.turnover ?? '—'} sub={`입차 ${stats?.kpi.todayIn ?? '—'} / 출차 ${stats?.kpi.todayOut ?? '—'}`} />
          <KpiCard icon={faRobot} label="탐지 정확도 (mAP@50)" value={stats ? (stats.kpi.mAP * 100).toFixed(1) : '—'} unit="%" sub={`번호판 인식률 ${stats ? (stats.kpi.ocrRate * 100).toFixed(1) : '—'}%`} />
        </div>
      </section>

      {/* 기능 진입 */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-display text-2xl font-bold text-slate-800">주요 기능</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <FontAwesomeIcon icon={f.icon} />
              </span>
              <h3 className="mt-4 font-bold text-slate-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
