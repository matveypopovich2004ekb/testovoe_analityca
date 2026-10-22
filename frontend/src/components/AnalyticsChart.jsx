import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  formatAxisPrice,
  formatDate,
  formatPrice,
  getSegmentIndex,
  parseCalendarDate,
  SEGMENT_COLORS,
} from '../utils'

const DAY = 24 * 60 * 60 * 1000

function RealizationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload
  return (
    <div className="chart-tooltip">
      {point.product && <strong>{point.product}</strong>}
      <dl>
        <div><dt>Дата</dt><dd>{formatDate(point.timestamp)}</dd></div>
        <div><dt>Цена</dt><dd>{formatPrice(point.price)}</dd></div>
        {point.segmentName && <div><dt>Сегмент</dt><dd>{point.segmentName}</dd></div>}
      </dl>
      {point.overlapCount > 1 && <p>В этой позиции графика: {point.overlapCount}</p>}
    </div>
  )
}

function PriceDot({ cx, cy, payload, activeSegment }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

  const isMuted = activeSegment !== null && payload.segmentIndex !== activeSegment
  return (
    <g className="price-dot" style={{ opacity: isMuted ? 0.14 : 1 }}>
      {payload.overlapCount > 1 && (
        <circle cx={cx} cy={cy} r={7} fill="none" stroke={payload.color} strokeWidth={1.5} opacity={0.45} />
      )}
      <circle cx={cx} cy={cy} r={4.5} fill={payload.color} stroke="#fff" strokeWidth={1.5} />
    </g>
  )
}

function BoundaryLabel({ viewBox, value }) {
  if (!viewBox) return null
  const x = viewBox.x + viewBox.width - 4
  const y = viewBox.y - 6

  return (
    <text className="boundary-label" x={x} y={y} textAnchor="end">
      {formatAxisPrice(value)}
    </text>
  )
}

function createDomains(points, analytics) {
  const timestamps = points.map((point) => point.timestamp)
  const minDate = Math.min(...timestamps)
  const maxDate = Math.max(...timestamps)
  const datePadding = minDate === maxDate ? DAY : Math.max(DAY * 0.35, (maxDate - minDate) * 0.025)

  const rangeValues = [analytics.min_price, analytics.max_price, ...analytics.segments.flatMap((segment) => [segment.min_price, segment.max_price])]
    .map(Number)
    .filter(Number.isFinite)
  const minPrice = Math.min(...rangeValues)
  const maxPrice = Math.max(...rangeValues)
  const pricePadding = minPrice === maxPrice ? Math.max(Math.abs(minPrice) * 0.08, 1) : (maxPrice - minPrice) * 0.07

  return {
    x: [minDate - datePadding, maxDate + datePadding],
    y: [Math.max(0, minPrice - pricePadding), maxPrice + pricePadding],
  }
}

export default function AnalyticsChart({ analytics, activeSegment }) {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const effectiveSegment = hoveredSegment ?? activeSegment

  const points = useMemo(() => {
    const prepared = analytics.realizations
      .map((realization, index) => {
        const timestamp = parseCalendarDate(realization.date)
        const segmentIndex = getSegmentIndex(realization.price, analytics.segments)
        return {
          ...realization,
          id: `${realization.date}-${realization.product}-${index}`,
          timestamp,
          segmentIndex,
          segmentName: analytics.segments[segmentIndex]?.name,
          color: segmentIndex >= 0 ? SEGMENT_COLORS[segmentIndex % SEGMENT_COLORS.length] : '#64748b',
        }
      })
      .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(Number(point.price)))

    const overlapCounts = prepared.reduce((counts, point) => {
      const key = `${point.timestamp}:${point.price}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
      return counts
    }, new Map())

    return prepared.map((point) => ({
      ...point,
      overlapCount: overlapCounts.get(`${point.timestamp}:${point.price}`),
    }))
  }, [analytics])

  const domains = useMemo(() => createDomains(points, analytics), [points, analytics])
  const boundaries = useMemo(() => {
    const values = analytics.segments.flatMap((segment) => [segment.min_price, segment.max_price])
    return [...new Set(values.map(Number))]
  }, [analytics.segments])

  return (
    <section className="chart-panel" aria-label="График реализаций">
      <div className="chart-panel__header">
        <div className="panel-heading">
          <p className="eyebrow">Динамика выборки</p>
          <h2>Распределение реализаций по цене и дате</h2>
          <p>Каждая точка — отдельная товарная позиция реализации.</p>
        </div>
        <span className="chart-panel__count">{analytics.realizations.length} точек</span>
      </div>

      {!analytics.segments.length && (
        <div className="chart-note">Все цены в выборке совпадают — ценовые диапазоны не сформированы.</div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 28, bottom: 18, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#e7ebf2" strokeDasharray="3 4" />

            {analytics.segments.map((segment, index) => (
              <ReferenceArea
                key={`${segment.name}-${segment.min_price}`}
                y1={segment.min_price}
                y2={segment.max_price}
                fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                fillOpacity={effectiveSegment === null || effectiveSegment === index ? 0.105 : 0.025}
                stroke="none"
                ifOverflow="extendDomain"
              />
            ))}

            {boundaries.map((boundary) => (
              <ReferenceLine
                key={boundary}
                y={boundary}
                stroke="#738098"
                strokeWidth={1}
                strokeDasharray="5 5"
                label={<BoundaryLabel value={boundary} />}
              />
            ))}

            <XAxis
              type="number"
              dataKey="timestamp"
              domain={domains.x}
              scale="time"
              tickCount={6}
              minTickGap={28}
              tickFormatter={formatDate}
              tick={{ fill: '#68738a', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#cfd6e2' }}
              label={{ value: 'Дата реализации', position: 'insideBottom', offset: -12, fill: '#68738a', fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="price"
              domain={domains.y}
              width={72}
              tickCount={7}
              tickFormatter={formatAxisPrice}
              tick={{ fill: '#68738a', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Цена, ₽', angle: -90, position: 'insideLeft', offset: 10, fill: '#68738a', fontSize: 12 }}
            />
            <Tooltip content={<RealizationTooltip />} cursor={false} isAnimationActive={false} />
            <Scatter
              data={points}
              shape={(props) => <PriceDot {...props} activeSegment={effectiveSegment} />}
              isAnimationActive
              animationDuration={450}
              onMouseEnter={(point) => {
                const segmentIndex = point.payload?.segmentIndex
                setHoveredSegment(segmentIndex >= 0 ? segmentIndex : null)
              }}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
