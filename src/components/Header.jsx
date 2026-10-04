import { LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/categories': 'Categories',
  '/categories/new': 'Create Category',
  '/products': 'Products',
  '/products/new': 'Create Product',
}

function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const editMatch = pathname.match(/^\/(categories|products)\/[^/]+\/edit$/)
  const pageTitle = editMatch
    ? `Edit ${editMatch[1] === 'categories' ? 'Category' : 'Product'}`
    : pageTitles[pathname] ?? 'Dashboard'

  return (
    <header className="flex flex-col gap-2 border-b border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p className="text-sm font-medium text-text">{pageTitle}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="text-sm text-muted">Varsha Homemade</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-success" role="status">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          Authenticated
        </span>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/authenticate', { replace: true })
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <LogOut size={16} aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header