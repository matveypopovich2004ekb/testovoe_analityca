const priceFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

export const SEGMENT_COLORS = ['#3b6ee8', '#119a9a', '#3b9a66', '#d58a19', '#8558c7']

export function formatPrice(value) {
  return Number.isFinite(Number(value)) ? `${priceFormatter.format(Number(value))} ₽` : '—'
}

export function formatPriceRange(segment) {
  return `${priceFormatter.format(segment.min_price)}–${priceFormatter.format(segment.max_price)} ₽`
}

export function formatAxisPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  if (Math.abs(number) >= 1_000_000) return `${priceFormatter.format(number / 1_000_000)} млн`
  if (Math.abs(number) >= 1_000) return `${priceFormatter.format(number / 1_000)} тыс.`
  return priceFormatter.format(number)
}

export function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return Number.NaN
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function formatDate(value) {
  const timestamp = typeof value === 'number' ? value : parseCalendarDate(value)
  return Number.isFinite(timestamp) ? dateFormatter.format(timestamp) : ''
}

export function getSegmentIndex(price, segments) {
  const numericPrice = Number(price)
  return segments.findIndex((segment, index) => {
    const isLast = index === segments.length - 1
    return numericPrice >= segment.min_price && (numericPrice < segment.max_price || (isLast && numericPrice <= segment.max_price))
  })
}
