import { formatPrice } from '../utils'

const metricDefinitions = [
  { key: 'min', label: 'Минимальная цена', className: 'blue' },
  { key: 'max', label: 'Максимальная цена', className: 'violet' },
  { key: 'realizations', label: 'Реализаций', className: 'teal' },
  { key: 'segments', label: 'Ценовых сегментов', className: 'amber' },
]

function MetricIcon({ type }) {
  if (type === 'realizations') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9m7 10V5m7 14v-7" />
      </svg>
    )
  }

  if (type === 'segments') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6h14M5 12h14M5 18h14" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={type === 'min' ? 'm7 10 5 5 5-5M12 4v11' : 'm7 14 5-5 5 5M12 20V9'} />
    </svg>
  )
}

export default function MetricCards({ analytics, loading }) {
  const values = {
    min: formatPrice(analytics?.min_price),
    max: formatPrice(analytics?.max_price),
    realizations: analytics?.realizations.length ?? '—',
    segments: analytics?.segments.length ?? '—',
  }

  return (
    <section className="metrics" aria-label="Ключевые показатели" aria-busy={loading}>
      {metricDefinitions.map((metric) => (
        <article className={`metric-card metric-card--${metric.className}`} key={metric.key}>
          <span className="metric-card__icon"><MetricIcon type={metric.key} /></span>
          <div>
            <p>{metric.label}</p>
            {loading ? <span className="skeleton skeleton--value" /> : <strong>{values[metric.key]}</strong>}
          </div>
        </article>
      ))}
    </section>
  )
}
