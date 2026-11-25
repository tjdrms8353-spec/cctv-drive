import { useEffect, useState, useCallback } from 'react'
import { api, subscribeParking } from '../api/client.js'

// 주차장 현황 + 실시간 구독 훅 (WebSocket 또는 Mock 시뮬레이터)
export function useParking() {
  const [lot, setLot] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])

  useEffect(() => {
    api('/api/parking/lot').then(setLot).catch(console.error)
  }, [])

  useEffect(() => {
    const unsub = subscribeParking(
      (data) => setLot(data),
      (ev) => setLiveEvents((prev) => [ev, ...prev].slice(0, 20)),
    )
    return unsub
  }, [])

  return { lot, liveEvents }
}

export function useApi(path, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api(path)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(load, [load])
  return { data, loading, error, reload: load }
}
