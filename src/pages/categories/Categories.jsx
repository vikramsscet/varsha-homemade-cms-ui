import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { deleteCategory, getCategories } from '../../services/category.service.js'

function Categories() {
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [retryKey, setRetryKey] = useState(0)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCategories() {
      setStatus('loading')

      try {
        const response = await getCategories()
        const categoryList = response.data?.data ?? response.data

        if (!Array.isArray(categoryList)) {
          throw new Error('Unexpected categories response')
        }

        if (isCurrent) {
          setCategories(categoryList)
          setStatus('ready')
        }
      } catch (error) {
        console.error('Categories request failed:', error)
        if (isCurrent) setStatus('error')
      }
    }

    loadCategories()

    return () => {
      isCurrent = false
    }
  }, [retryKey])

  const handleDelete = async () => {
    if (!categoryToDelete || isDeleting) return

    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
      setRetryKey((key) => key + 1)
    } catch (error) {
      console.error('Category deletion failed:', error)
      const statusCode = error.response?.status
      const backendMessage = error.response?.data?.message

      if ([400, 404, 409].includes(statusCode) && typeof backendMessage === 'string') {
        setDeleteError(backendMessage)
      } else {
        setDeleteError('Unable to delete category. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Categories</h1>
        <Link
          to="/categories/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          Add Category
        </Link>
      </div>

      {status === 'loading' ? (
        <div className="min-h-40 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">
          Loading categories...
        </div>
      ) : status === 'error' ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-error" role="alert">
            Unable to load categories.
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm font-medium text-text">No categories found.</p>
          <Link
            to="/categories/new"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-background text-xs font-medium uppercase text-muted">
              <tr>
                <th scope="col" className="px-5 py-3.5">Name</th>
                <th scope="col" className="px-5 py-3.5">Slug</th>
                <th scope="col" className="px-5 py-3.5">Description</th>
                <th scope="col" className="px-5 py-3.5">Display Order</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-text">
                    {category.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">
                    {category.slug}
                  </td>
                  <td className="max-w-sm px-5 py-4 text-muted">
                    {category.description || '—'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-text">
                    {category.displayOrder}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        category.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-background text-muted'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/categories/${category.id}/edit`}
                        className="font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('')
                          setCategoryToDelete(category)
                        }}
                        className="font-medium text-error hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-text/35 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg"
          >
            <h2 id="delete-category-title" className="text-lg font-semibold text-text">
              Delete Category
            </h2>
            <p id="delete-category-description" className="mt-4 text-sm text-text">
              Are you sure you want to delete &quot;{categoryToDelete.name}&quot;?
            </p>
            <p className="mt-2 text-sm text-muted">
              This action cannot be undone.
            </p>
            {deleteError && (
              <p className="mt-4 text-sm text-error" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCategoryToDelete(null)}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-md bg-error px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Categories