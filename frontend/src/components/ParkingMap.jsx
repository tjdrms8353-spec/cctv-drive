// 층/구역별 주차면 맵 — SVG 기반, 상태 컬러 시스템 적용
export const SPOT_COLORS = {
  free: 'var(--color-spot-free)',
  occupied: 'var(--color-spot-occupied)',
  disabled: 'var(--color-spot-disabled)',
  ev: 'var(--color-spot-ev)',
  reserved: 'var(--color-spot-reserved)',
  event: 'var(--color-spot-event)',
}

export function spotColor(spot) {
  if (spot.status === 'event') return SPOT_COLORS.event
  if (spot.status === 'occupied') return SPOT_COLORS.occupied
  if (spot.type === 'disabled') return SPOT_COLORS.disabled
  if (spot.type === 'ev') return SPOT_COLORS.ev
  if (spot.type === 'reserved') return SPOT_COLORS.reserved
  return SPOT_COLORS.free
}

export function Legend({ dark = false }) {
  const items = [
    ['빈 자리', SPOT_COLORS.free],
    ['점유', SPOT_COLORS.occupied],
    ['장애인 전용', SPOT_COLORS.disabled],
    ['전기차 충전', SPOT_COLORS.ev],
    ['예약/임시', SPOT_COLORS.reserved],
    ['이상 이벤트', SPOT_COLORS.event],
  ]
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className={`h-3 w-3 rounded-sm ${label === '이상 이벤트' ? 'spot-event' : ''}`}
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  )
}

// zone 단위 그리드 배치 (구역당 5열)
const COLS = 5
const W = 46
const H = 30
const GAP = 8
const ZONE_GAP = 40

export default function ParkingMap({ spots, floor, highlight, onSelect, dark = false }) {
  const zones = [...new Set(spots.filter((s) => s.floor === floor).map((s) => s.zone))]
  const zoneSpots = zones.map((z) => spots.filter((s) => s.floor === floor && s.zone === z))

  const zoneW = COLS * (W + GAP) + 30
  const zoneH = Math.ceil(Math.max(...zoneSpots.map((z) => z.length)) / COLS) * (H + GAP) + 50
  const width = zones.length * (zoneW + ZONE_GAP) + 20
  const height = zoneH + 20

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full rounded-xl ${dark ? 'bg-ink-800' : 'bg-slate-100'}`}
      role="img"
      aria-label="주차면 맵"
    >
      {zones.map((zone, zi) => {
        const list = zoneSpots[zi]
        const ox = 10 + zi * (zoneW + ZONE_GAP)
        return (
          <g key={zone} transform={`translate(${ox}, 10)`}>
            <text x="4" y="20" className={`text-sm font-bold ${dark ? 'fill-slate-300' : 'fill-slate-600'}`}>
              {zone}구역
            </text>
            {/* 차로 */}
            <rect
              x="0" y="28" width={zoneW} height="14" rx="3"
              className={dark ? 'fill-ink-700' : 'fill-slate-300'}
            />
            {list.map((s, i) => {
              const col = i % COLS
              const row = Math.floor(i / COLS)
              const x = 15 + col * (W + GAP)
              const y = 50 + row * (H + GAP)
              const isHl = highlight === s.id
              return (
                <g key={s.id} onClick={() => onSelect?.(s)} className="cursor-pointer">
                  <rect
                    x={x} y={y} width={W} height={H} rx="5"
                    fill={spotColor(s)}
                    opacity={s.status === 'occupied' ? 0.85 : 0.7}
                    className={s.status === 'event' ? 'spot-event' : ''}
                    stroke={isHl ? '#fff' : 'transparent'}
                    strokeWidth={isHl ? 3 : 0}
                  />
                  {isHl && (
                    <rect
                      x={x - 3} y={y - 3} width={W + 6} height={H + 6} rx="7"
                      fill="none" stroke="#facc15" strokeWidth="2.5"
                    />
                  )}
                  <text
                    x={x + W / 2} y={y + H / 2 + 4}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-semibold"
                  >
                    {s.zone}{s.num}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
