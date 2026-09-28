import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/categories': 'Categories',
  '/categories/new': 'Create Category',
  '/products': 'Products',
  '/products/new': 'Create Product',
}

function Header() {
  const { pathname } = useLocation()
  const editMatch = pathname.match(/^\/(categories|products)\/[^/]+\/edit$/)
  const pageTitle = editMatch
    ? `Edit ${editMatch[1] === 'categories' ? 'Category' : 'Product'}`
    : pageTitles[pathname] ?? 'Dashboard'

  return (
    <header className="flex flex-col gap-2 border-b border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p className="text-sm font-medium text-text">{pageTitle}</p>
      <p className="text-sm text-muted">Varsha Homemade</p>
    </header>
  )
}

export default Header