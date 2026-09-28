import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory } from '../../services/category.service.js'
import CategoryForm from '../../components/categories/CategoryForm.jsx'

function CreateCategory() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const onSubmit = async ({ name, slug, description, displayOrder, isActive }) => {
    setApiError('')

    try {
      await createCategory({
        name: name.trim(),
        slug: slug.trim(),
        description,
        displayOrder,
        isActive,
      })
      navigate('/categories')
    } catch (error) {
      console.error('Category creation failed:', error)
      setApiError(
        error.response?.status === 409
          ? 'A category with this slug already exists.'
          : 'Unable to create category. Please try again.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text sm:text-3xl">Create Category</h1>
      <CategoryForm
        defaultValues={{
          name: '',
          slug: '',
          description: '',
          displayOrder: 1,
          isActive: true,
        }}
        onSubmit={onSubmit}
        onCancel={() => navigate('/categories')}
        submitLabel="Create Category"
        pendingLabel="Creating..."
        apiError={apiError}
      />
    </div>
  )
}

export default CreateCategory