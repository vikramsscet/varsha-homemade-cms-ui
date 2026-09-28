import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CategoryForm from '../../components/categories/CategoryForm.jsx'
import { getCategory, updateCategory } from '../../services/category.service.js'

function EditCategory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadCategory() {
      setLoadState('loading')

      try {
        const response = await getCategory(id)
        if (isCurrent) {
          setCategory(response.data)
          setLoadState('ready')
        }
      } catch (error) {
        console.error('Category request failed:', error)
        if (isCurrent) {
          setLoadState(error.response?.status === 404 ? 'notFound' : 'error')
        }
      }
    }

    loadCategory()

    return () => {
      isCurrent = false
    }
  }, [id])

  const handleSubmit = async ({ name, slug, description, displayOrder, isActive }) => {
    setApiError('')

    try {
      await updateCategory(id, {
        name: name.trim(),
        slug: slug.trim(),
        description,
        displayOrder,
        isActive,
      })
      navigate('/categories')
    } catch (error) {
      console.error('Category update failed:', error)
      const statusCode = error.response?.status
      const backendMessage = error.response?.data?.message

      if (statusCode === 409) {
        setApiError('A category with this slug already exists.')
      } else if (statusCode === 404) {
        setApiError('Category not found.')
      } else if (statusCode === 400 && typeof backendMessage === 'string') {
        setApiError(backendMessage)
      } else {
        setApiError('Unable to update category. Please try again.')
      }
    }
  }

  const backButton = (
    <button
      type="button"
      onClick={() => navigate('/categories')}
      className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      Back to Categories
    </button>
  )

  if (loadState === 'loading') {
    return <p className="text-sm text-muted" role="status">Loading category...</p>
  }

  if (loadState === 'notFound') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-error" role="alert">Category not found.</p>
        {backButton}
      </div>
    )
  }

  if (loadState === 'error' || !category) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-error" role="alert">
          Unable to load category. Please try again.
        </p>
        {backButton}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text sm:text-3xl">Edit Category</h1>
      <CategoryForm
        key={category.id}
        defaultValues={{
          name: category.name ?? '',
          slug: category.slug ?? '',
          description: category.description ?? '',
          displayOrder: category.displayOrder ?? 0,
          isActive: category.isActive ?? true,
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/categories')}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        apiError={apiError}
      />
    </div>
  )
}

export default EditCategory