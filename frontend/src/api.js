async function requestJson(url, signal) {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return response.json()
}

export async function getCategories(signal) {
  const data = await requestJson('/api/categories', signal)

  if (!Array.isArray(data.categories)) {
    throw new Error('Unexpected categories response')
  }

  return data.categories.filter((category) => typeof category === 'string' && category.trim())
}

export async function getPriceAnalytics(category, signal) {
  const search = new URLSearchParams()
  if (category) search.set('category', category)

  const query = search.size ? `?${search.toString()}` : ''
  const data = await requestJson(`/api/analytics/pricesondate${query}`, signal)

  if (!Array.isArray(data.segments) || !Array.isArray(data.realizations)) {
    throw new Error('Unexpected analytics response')
  }

  return data
}
