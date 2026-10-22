export function DashboardSkeleton() {
  return (
    <section className="chart-panel chart-panel--skeleton" aria-label="Загрузка аналитики" aria-busy="true">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--subtitle" />
      <div className="skeleton skeleton--chart" />
    </section>
  )
}

export default function StatePanel({ type, onRetry }) {
  const isError = type === 'error'

  return (
    <section className={`state-panel state-panel--${type}`} role={isError ? 'alert' : 'status'}>
      <span className="state-panel__icon" aria-hidden="true">
        {isError ? '!' : '○'}
      </span>
      <h2>{isError ? 'Не удалось загрузить аналитику' : 'Для выбранной категории нет данных'}</h2>
      <p>
        {isError
          ? 'Проверьте доступность сервиса и попробуйте выполнить запрос ещё раз.'
          : 'В ответе API нет реализаций, поэтому график и ценовые диапазоны не построены.'}
      </p>
      {isError && <button className="button button--primary" type="button" onClick={onRetry}>Повторить запрос</button>}
    </section>
  )
}
