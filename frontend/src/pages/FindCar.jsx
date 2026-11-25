import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarSide, faMagnifyingGlass, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import ParkingMap, { Legend } from '../components/ParkingMap.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useParking } from '../hooks/useParking.js'

export default function FindCar() {
  const { user } = useAuth()
  const { lot } = useParking()
  const [plate, setPlate] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const search = async (e) => {
    e.preventDefault()
    if (!plate.trim()) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await api(`/api/vehicles/${encodeURIComponent(plate.trim())}`))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const masked = (p) => (user?.role === 'test_admin' ? p.replace(/\d{4}$/, '****') : p)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800">내 차 찾기</h1>
      <p className="mt-1 text-sm text-slate-500">번호판 OCR로 인식된 차량의 주차 위치를 조회합니다</p>

      <form onSubmit={search} className="mt-8 flex max-w-xl gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faCarSide} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={plate} onChange={(e) => setPlate(e.target.value)}
            placeholder="차량 번호 입력 (예: 12가 3456)"
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit" disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 조회
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-400">데모 인식 차량: 12가 3456 · 34나 7890 · 56다 1234</p>

      {error && <p className="mt-6 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-brand-700">
              <FontAwesomeIcon icon={faLocationDot} />
              <h2 className="font-display text-lg font-bold">{result.spot}</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">차량 번호</dt><dd className="font-semibold">{masked(result.plate)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">주차 층</dt><dd className="font-semibold">{result.floor === 'B1' ? '지하 1층' : '지하 2층'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">입차 시각</dt><dd className="font-semibold">{result.enteredAt}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">OCR 신뢰도</dt><dd className="font-semibold">{(result.confidence * 100).toFixed(0)}%</dd></div>
            </dl>
            {user?.role === 'test_admin' && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                테스트 관리자 화면은 개인정보 보호를 위해 번호판이 마스킹됩니다
              </p>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">주차 위치</h2>
              <Legend />
            </div>
            {lot && <ParkingMap spots={lot.spots} floor={result.floor} highlight={result.spot} />}
          </div>
        </div>
      )}
    </div>
  )
}
