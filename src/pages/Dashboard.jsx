import { useEffect, useState } from 'react'
import { Folder, Package, RefreshCw } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { getCategories } from '../services/category.service.js'
import { getHealth } from '../services/health.service.js'
import { getProducts } from '../services/product.service.js'

const getProductCount = (responseData) => {
  const total = responseData?.pagination?.total
  if (Number.isFinite(total)) return total

  const products = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
      ? responseData
      : null

  if (products) return products.length
  throw new Error('Unexpected products response')
}

const getCategoryCount = (responseData) => {
  const categories = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData

  if (Array.isArray(categories)) return categories.length
  throw new Error('Unexpected categories response')
}

function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState({ value: null, loading: true, error: false })
  const [categories, setCategories] = useState({ value: null, loading: true, error: false })
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setProducts((current) => ({ ...current, loading: true, error: false }))
    setCategories((current) => ({ ...current, loading: true, error: false }))
    setApiStatus('checking')

    const healthRequest = getHealth()
      .then(() => {
        if (isCurrent) setApiStatus('connected')
      })
      .catch((error) => {
        console.error('Health check failed:', error)
        if (isCurrent) setApiStatus('disconnected')
      })

    const productsRequest = getProducts()
      .then(({ data }) => {
        const value = getProductCount(data)
        if (isCurrent) setProducts({ value, loading: false, error: false })
      })
      .catch((error) => {
        console.error('Products request failed:', error)
        if (isCurrent) setProducts({ value: null, loading: false, error: true })
      })

    const categoriesRequest = getCategories()
      .then(({ data }) => {
        const value = getCategoryCount(data)
        if (isCurrent) setCategories({ value, loading: false, error: false })
      })
      .catch((error) => {
        console.error('Categories request failed:', error)
        if (isCurrent) setCategories({ value: null, loading: false, error: true })
      })

    Promise.all([healthRequest, productsRequest, categoriesRequest]).finally(() => {
      if (isCurrent) setIsLoading(false)
    })

    return () => {
      isCurrent = false
    }
  }, [refreshKey])

  const statusText = apiStatus === 'checking'
    ? 'Checking...'
    : apiStatus === 'connected'
      ? '● Connected'
      : '● Disconnected'
  const statusColor = apiStatus === 'connected'
    ? 'text-success'
    : apiStatus === 'disconnected'
      ? 'text-error'
      : 'text-muted'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Dashboard</h1>
          <p className="mt-2 min-h-5 text-sm text-muted" role="status">
            {isLoading ? 'Loading dashboard...' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Products"
          value={products.value}
          icon={Package}
          loading={products.loading}
          error={products.error}
        />
        <StatCard
          title="Categories"
          value={categories.value}
          icon={Folder}
          loading={categories.loading}
          error={categories.error}
        />
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6" aria-labelledby="api-status-title">
        <h2 id="api-status-title" className="text-sm font-medium text-muted">
          API Status
        </h2>
        <p role="status" className={`mt-4 text-base font-medium ${statusColor}`}>
          {statusText}
        </p>
      </section>
    </div>
  )
}

export default Dashboard