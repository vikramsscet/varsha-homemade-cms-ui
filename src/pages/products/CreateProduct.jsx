import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductForm from '../../components/products/ProductForm.jsx'
import { getCategories } from '../../services/category.service.js'
import { createProduct } from '../../services/product.service.js'

function CreateProduct() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [categoryStatus, setCategoryStatus] = useState('loading')
  const [categoryRetryKey, setCategoryRetryKey] = useState(0)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let isCurrent = true
    setCategoryStatus('loading')

    async function loadCategories() {
      try {
        const response = await getCategories()
        const categoryList = response.data?.data ?? response.data
        if (!Array.isArray(categoryList)) throw new Error('Unexpected categories response')

        if (isCurrent) {
          setCategories(categoryList)
          setCategoryStatus('ready')
        }
      } catch (error) {
        console.error('Category request failed:', error)
        if (isCurrent) setCategoryStatus('error')
      }
    }

    loadCategories()
    return () => {
      isCurrent = false
    }
  }, [categoryRetryKey])

  const handleSubmit = async (values) => {
    setApiError('')

    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      subtitle: values.subtitle,
      description: values.description,
      price: Number(values.price),
      currency: values.currency,
      packageSize: values.packageSize,
      categoryId: values.categoryId,
      status: values.status,
      isFeatured: Boolean(values.isFeatured),
      isAvailable: Boolean(values.isAvailable),
      displayOrder: Number(values.displayOrder),
    }

    try {
      await createProduct(payload)
      navigate('/products')
    } catch (error) {
      console.error('Product creation failed:', error)
      const statusCode = error.response?.status
      const backendMessage = error.response?.data?.message

      if (statusCode === 409) {
        setApiError('A product with this slug already exists.')
      } else if (statusCode === 400 && typeof backendMessage === 'string') {
        setApiError(backendMessage)
      } else {
        setApiError('Unable to create product. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text sm:text-3xl">Create Product</h1>
      <ProductForm
        mode="create"
        categories={categories}
        categoriesLoading={categoryStatus === 'loading'}
        categoriesError={categoryStatus === 'error'}
        onRetryCategories={() => setCategoryRetryKey((key) => key + 1)}
        onCancel={() => navigate('/products')}
        onSubmit={handleSubmit}
        apiError={apiError}
      />
    </div>
  )
}

export default CreateProduct