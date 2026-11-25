import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute, faLocationDot, faWheelchair, faChargingStation, faCar } from '@fortawesome/free-solid-svg-icons'
import ParkingMap, { Legend } from '../components/ParkingMap.jsx'
import { useParking } from '../hooks/useParking.js'
import { api } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'

const TYPES = [
  { id: 'normal', label: '일반', icon: faCar },
  { id: 'disabled', label: '장애인 전용', icon: faWheelchair },
  { id: 'ev', label: '전기차 충전', icon: faChargingStation },
]

export default function Guide() {
  const { lot } = useParking()
  const { toast } = useToast()
  const [type, setType] = useState('normal')
  const [floor, setFloor] = useState('B1')
  const [rec, setRec] = useState(null)
  const [busy, setBusy] = useState(false)

  const recommend = async () => {
    setBusy(true)
    try {
      const data = await api(`/api/parking/recommend?type=${type}&floor=${floor}`)
      setRec(data)
    } catch (e) {
      toast(e.message, 'warn')
      setRec(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800">주차 유도</h1>
      <p className="mt-1 text-sm text-slate-500">진입 위치와 선호 조건에 맞는 가장 가까운 빈 주차면을 안내합니다</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">주차 조건</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500">주차면 종류</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                      type === t.id ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <FontAwesomeIcon icon={t.icon} className="text-base" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">선호 층</label>
              <div className="mt-2 flex gap-2">
                {lot?.floors.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFloor(f.id)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                      floor === f.id ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={recommend} disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRoute} /> 빈 주차면 추천받기
            </button>
          </div>

          {rec && (
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
              <div className="flex items-center gap-2 text-brand-700">
                <FontAwesomeIcon icon={faLocationDot} />
                <span className="font-display text-lg font-bold">{rec.spot.id}</span>
              </div>
              <p className="mt-1 text-xs text-brand-600">예상 도착 {Math.round(rec.etaSec / 60)}분 이내</p>
              <ol className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li>1. {floor} 진입로로 진입하세요</li>
                <li>2. {rec.spot.zone}구역 방향으로 직진하세요</li>
                <li>3. {rec.spot.id} 번호 표시 면에 주차하세요</li>
              </ol>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">{floor} 주차면 현황</h2>
            <Legend />
          </div>
          {lot && (
            <ParkingMap spots={lot.spots} floor={floor} highlight={rec?.spot.id} onSelect={() => {}} />
          )}
          <p className="mt-3 text-xs text-slate-400">추천 주차면은 노란색 테두리로 표시됩니다</p>
        </div>
      </div>
    </div>
  )
}
