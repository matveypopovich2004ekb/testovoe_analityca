import { useEffect, useState } from 'react'

import { formatPriceRange, SEGMENT_COLORS } from '../utils'

export default function SegmentLegend({ segments, activeSegment, setActiveSegment }) {
  const [selectedSegment, setSelectedSegment] = useState(null)

  useEffect(() => {
    setSelectedSegment(null)
    setActiveSegment(null)
  }, [segments, setActiveSegment])

  function toggleSegment(index) {
    const nextSegment = selectedSegment === index ? null : index
    setSelectedSegment(nextSegment)
    setActiveSegment(nextSegment)
  }

  if (!segments.length) {
    return (
      <aside className="legend-panel">
        <div className="panel-heading">
          <p className="eyebrow">Легенда</p>
          <h2>Ценовые сегменты</h2>
        </div>
        <p className="legend-empty">Диапазоны недоступны для текущей выборки.</p>
      </aside>
    )
  }

  return (
    <aside className="legend-panel" aria-label="Легенда ценовых сегментов">
      <div className="panel-heading">
        <p className="eyebrow">Легенда</p>
        <h2>Ценовые сегменты</h2>
        <p>Наведите или нажмите, чтобы выделить диапазон.</p>
      </div>

      <div className="legend-list">
        {segments.map((segment, index) => {
          const isActive = activeSegment === index
          const isMuted = activeSegment !== null && !isActive

          return (
            <button
              className={`legend-item${isActive ? ' is-active' : ''}${isMuted ? ' is-muted' : ''}`}
              type="button"
              key={`${segment.name}-${segment.min_price}-${segment.max_price}`}
              aria-pressed={selectedSegment === index}
              onClick={() => toggleSegment(index)}
              onMouseEnter={() => setActiveSegment(index)}
              onMouseLeave={() => setActiveSegment(selectedSegment)}
              onFocus={() => setActiveSegment(index)}
              onBlur={() => setActiveSegment(selectedSegment)}
            >
              <span className="legend-item__marker" style={{ '--segment-color': SEGMENT_COLORS[index % SEGMENT_COLORS.length] }} />
              <span className="legend-item__copy">
                <strong>{segment.name}</strong>
                <span>{formatPriceRange(segment)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
