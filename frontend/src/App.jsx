import { useCallback, useEffect, useState } from 'react'

import { getCategories, getPriceAnalytics } from './api'
import AnalyticsChart from './components/AnalyticsChart'
import MetricCards from './components/MetricCards'
import SegmentLegend from './components/SegmentLegend'
import StatePanel, { DashboardSkeleton } from './components/StatePanel'

export default function App() {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)
  const [categoriesRequest, setCategoriesRequest] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(false)
  const [analyticsRequest, setAnalyticsRequest] = useState(0)
  const [activeSegment, setActiveSegment] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setCategoriesLoading(true)
    setCategoriesError(false)

    getCategories(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCategories(result)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCategoriesError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false)
      })

    return () => controller.abort()
  }, [categoriesRequest])

  useEffect(() => {
    const controller = new AbortController()
    setAnalyticsLoading(true)
    setAnalyticsError(false)

    getPriceAnalytics(selectedCategory, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setAnalytics(result)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setAnalytics(null)
          setAnalyticsError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAnalyticsLoading(false)
      })

    return () => controller.abort()
  }, [selectedCategory, analyticsRequest])

  const retryAnalytics = useCallback(() => setAnalyticsRequest((request) => request + 1), [])

  function changeCategory(event) {
    setSelectedCategory(event.target.value)
    setActiveSegment(null)
  }

  const selectionLabel = selectedCategory || 'Все категории'
  const hasData = analytics?.realizations.length > 0

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">BI</span>
          <div>
            <p className="eyebrow">Товарная аналитика</p>
            <h1>Аналитика реализаций</h1>
            <p className="brand__description">Распределение цен товаров по сегментам и датам реализации</p>
          </div>
        </div>
        <div className="source-badge">
          <span aria-hidden="true" />
          Источник: FastAPI · ClickHouse
        </div>
      </header>

      <main>
        <section className="filter-panel" aria-label="Фильтры аналитики">
          <div>
            <p className="eyebrow">Фильтр выборки</p>
            <h2>{selectionLabel}</h2>
            <p>Выберите категорию, чтобы обновить график и показатели.</p>
          </div>
          <div className="filter-control">
            <label htmlFor="category">Категория товара</label>
            <div className="select-wrap">
              <select id="category" value={selectedCategory} onChange={changeCategory} disabled={categoriesLoading}>
                <option value="">Все категории</option>
                {categories.map((category) => <option value={category} key={category}>{category}</option>)}
              </select>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
            </div>
            {categoriesLoading && <span className="filter-hint">Загружаем категории…</span>}
            {categoriesError && (
              <span className="filter-hint filter-hint--error">
                Категории недоступны.
                <button type="button" onClick={() => setCategoriesRequest((request) => request + 1)}>Повторить</button>
              </span>
            )}
            {!categoriesLoading && !categoriesError && !categories.length && (
              <span className="filter-hint">Список категорий пуст — доступна общая выборка.</span>
            )}
          </div>
        </section>

        <MetricCards analytics={analytics} loading={analyticsLoading} />

        {analyticsError ? (
          <StatePanel type="error" onRetry={retryAnalytics} />
        ) : analyticsLoading && !analytics ? (
          <DashboardSkeleton />
        ) : analytics && !hasData ? (
          <StatePanel type="empty" />
        ) : analytics ? (
          <div className={`analytics-layout${analyticsLoading ? ' is-loading' : ''}`} aria-busy={analyticsLoading}>
            <AnalyticsChart analytics={analytics} activeSegment={activeSegment} />
            <SegmentLegend
              segments={analytics.segments}
              activeSegment={activeSegment}
              setActiveSegment={setActiveSegment}
            />
            {analyticsLoading && <div className="loading-overlay"><span />Обновляем данные…</div>}
          </div>
        ) : null}
      </main>
    </div>
  )
}
