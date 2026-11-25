import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCar, faPercent, faTriangleExclamation, faCircle } from '@fortawesome/free-solid-svg-icons'
import ParkingMap, { Legend } from '../components/ParkingMap.jsx'
import KpiCard from '../components/KpiCard.jsx'
import { useParking, useApi } from '../hooks/useParking.js'
import { useAuth } from '../context/AuthContext.jsx'

// CCTV 영상 분석 뷰 — 데모용 바운딩 박스 오버레이 시뮬레이션
function CctvView({ dark }) {
  const [boxes, setBoxes] = useState([])

  useEffect(() => {
    const gen = () => {
      const kinds = [
        { label: 'CAR', color: '#22d3ee' },
        { label: 'CAR', color: '#22d3ee' },
        { label: 'PERSON', color: '#a78bfa' },
        { label: 'BIKE', color: '#fb923c' },
      ]
      setBoxes(
        kinds.slice(0, 2 + Math.floor(Math.random() * 3)).map((k, i) => ({
          ...k,
          id: Math.floor(Math.random() * 90) + 10,
          x: 8 + Math.random() * 60,
          y: 15 + Math.random() * 50,
          w: k.label === 'PERSON' ? 8 : 18,
          h: k.label === 'PERSON' ? 20 : 14,
          conf: (0.82 + Math.random() * 0.16).toFixed(2),
          key: `${i}-${Date.now()}`,
        })),
      )
    }
    gen()
    const t = setInterval(gen, 1600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl border ${dark ? 'border-ink-700 bg-ink-900' : 'border-slate-200 bg-slate-900'}`}>
      {/* 가상 CCTV 프레임 */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'linear-gradient(160deg,#1e293b 0%,#0f172a 55%,#1e293b 100%), repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(148,163,184,.12) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(148,163,184,.12) 40px)',
        }}
      />
      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-black/50 px-2 py-1 text-[11px] font-bold text-red-400">
        <FontAwesomeIcon icon={faCircle} className="h-2 animate-pulse" /> REC · CAM-B1-01
      </span>
      <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[11px] text-slate-300">
        {new Date().toLocaleTimeString('ko-KR')}
      </span>
      {boxes.map((b) => (
        <div
          key={b.key}
          className="absolute transition-all duration-700"
          style={{
            left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`,
            border: `2px solid ${b.color}`, borderRadius: 4,
          }}
        >
          <span
            className="absolute -top-5 left-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-bold text-black"
            style={{ backgroundColor: b.color }}
          >
            {b.label} #{b.id} {b.conf}
          </span>
        </div>
      ))}
      <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] text-slate-400">
        YOLO 탐지 + ByteTrack 추적 오버레이 (데모)
      </span>
    </div>
  )
}

export default function Monitor() {
  const { lot, liveEvents } = useParking()
  const { data: events } = useApi('/api/events')
  const { user } = useAuth()
  const [floor, setFloor] = useState('B1')
  const [selected, setSelected] = useState(null)

  const summary = useMemo(() => {
    if (!lot) return null
    const spots = lot.spots.filter((s) => s.floor === floor)
    const occ = spots.filter((s) => s.status === 'occupied').length
    return { total: spots.length, occupied: occ, free: spots.length - occ, rate: ((occ / spots.length) * 100).toFixed(1) }
  }, [lot, floor])

  const mask = (p) => (user?.role === 'test_admin' && p ? p.replace(/\d{4}$/, '****') : p)

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">실시간 주차관제</h1>
            <p className="mt-1 text-sm text-slate-400">{lot?.name ?? 'parkpick 타워 주차장'} · AI 이동체 인지 분석</p>
          </div>
          <div className="flex gap-2">
            {lot?.floors.map((f) => (
              <button
                key={f.id}
                onClick={() => setFloor(f.id)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  floor === f.id ? 'bg-brand-600 text-white' : 'bg-ink-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard dark icon={faCar} label={`${floor} 전체 / 점유`} value={summary ? `${summary.total - summary.free}/${summary.total}` : '—'} unit="면" />
          <KpiCard dark icon={faPercent} label={`${floor} 점유율`} value={summary?.rate ?? '—'} unit="%" />
          <KpiCard dark icon={faCar} label="빈 주차면" value={summary?.free ?? '—'} unit="면" />
          <KpiCard dark icon={faTriangleExclamation} label="진행 중 이벤트" value={(events?.filter((e) => !e.resolved).length ?? 0) + liveEvents.length} unit="건" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300">주차면 맵 — {floor}</h2>
              <Legend dark />
            </div>
            {lot ? (
              <ParkingMap spots={lot.spots} floor={floor} onSelect={setSelected} dark />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-ink-800 text-slate-500">로딩 중…</div>
            )}
            {selected && (
              <div className="mt-3 flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-800 p-4 text-sm">
                <span className="font-display font-bold text-white">{selected.id}</span>
                <span className="text-slate-400">
                  {selected.status === 'free' ? '빈 주차면' : `점유 중 · ${mask(selected.plate) ?? '차량'} · ${selected.since ?? ''}부터`}
                </span>
                <span className="ml-auto rounded bg-ink-700 px-2 py-1 text-xs text-slate-300">
                  {selected.type === 'disabled' ? '장애인 전용' : selected.type === 'ev' ? '전기차 충전' : selected.type === 'reserved' ? '예약/임시' : '일반'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="mb-3 text-sm font-bold text-slate-300">영상 분석 뷰</h2>
              <CctvView dark />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-bold text-slate-300">실시간 이벤트 피드</h2>
              <div className="dark-scroll max-h-64 space-y-2 overflow-y-auto rounded-xl border border-ink-700 bg-ink-800 p-3">
                {[...liveEvents, ...(events ?? [])].map((e) => (
                  <div key={e.id} className="flex items-start gap-3 rounded-lg bg-ink-900/60 p-3 text-sm">
                    <span
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        e.level === 'critical' ? 'spot-event bg-spot-event' : e.level === 'warning' ? 'bg-yellow-400' : 'bg-sky-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">[{e.label}]</span>
                        <span className="text-xs text-slate-500">{e.spot} · {e.time}</span>
                        {e.resolved && <span className="rounded bg-slate-700 px-1.5 text-[10px] text-slate-300">처리완료</span>}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{e.message}</p>
                    </div>
                  </div>
                ))}
                {![...liveEvents, ...(events ?? [])].length && (
                  <p className="p-3 text-center text-xs text-slate-500">이벤트가 없습니다</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
