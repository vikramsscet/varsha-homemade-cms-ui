import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProductForm from '../../components/products/ProductForm.jsx'
import { getCategories } from '../../services/category.service.js'
import { getProduct, updateProduct } from '../../services/product.service.js'

const emptyDescription = { type: 'doc', content: [{ type: 'paragraph' }] }

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [categories, setCategories] = useState([])
  const [categoryState, setCategoryState] = useState('loading')
  const [categoryRetryKey, setCategoryRetryKey] = useState(0)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadProduct() {
      setLoadState('loading')

      try {
        const response = await getProduct(id)
        if (isCurrent) {
          setProduct(response.data)
          setLoadState('ready')
        }
      } catch (error) {
        console.error('Product request failed:', error)
        if (isCurrent) {
          setLoadState(error.response?.status === 404 ? 'notFound' : 'error')
        }
      }
    }

    loadProduct()
    return () => {
      isCurrent = false
    }
  }, [id])

  useEffect(() => {
    let isCurrent = true
    setCategoryState('loading')

    async function loadCategories() {
      try {
        const response = await getCategories()
        const categoryList = response.data?.data ?? response.data
        if (!Array.isArray(categoryList)) throw new Error('Unexpected categories response')

        if (isCurrent) {
          setCategories(categoryList)
          setCategoryState('ready')
        }
      } catch (error) {
        console.error('Category request failed:', error)
        if (isCurrent) setCategoryState('error')
      }
    }

    loadCategories()
    return () => {
      isCurrent = false
    }
  }, [categoryRetryKey])

  const handleUpdate = async (values) => {
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
      await updateProduct(id, payload)
      navigate('/products')
    } catch (error) {
      console.error('Product update failed:', error)
      const statusCode = error.response?.status
      const backendMessage = error.response?.data?.message

      if (statusCode === 409) {
        setApiError('A product with this slug already exists.')
      } else if ((statusCode === 400 || statusCode === 422) && typeof backendMessage === 'string') {
        setApiError(backendMessage)
      } else {
        setApiError('Unable to update product. Please try again.')
      }
    }
  }

  if (loadState === 'loading') {
    return <p className="text-sm text-muted" role="status">Loading product...</p>
  }

  if (loadState === 'notFound' || loadState === 'error') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-error" role="alert">
          {loadState === 'notFound' ? 'Product not found.' : 'Unable to load product.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-background"
        >
          Back to Products
        </button>
      </div>
    )
  }

  const initialValues = {
    title: product.title ?? '',
    slug: product.slug ?? '',
    subtitle: product.subtitle ?? '',
    description: product.description ?? emptyDescription,
    price: product.price ?? '',
    currency: product.currency ?? 'INR',
    packageSize: product.packageSize ?? '',
    categoryId: product.category?.id ?? '',
    status: product.status ?? 'DRAFT',
    isFeatured: product.isFeatured ?? false,
    isAvailable: product.isAvailable ?? true,
    displayOrder: product.displayOrder ?? 1,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Edit Product</h1>
        <p className="mt-2 text-sm text-muted">{product.title}</p>
      </div>
      <ProductForm
        mode="edit"
        initialValues={initialValues}
        categories={categories}
        categoriesLoading={categoryState === 'loading'}
        categoriesError={categoryState === 'error'}
        onRetryCategories={() => setCategoryRetryKey((key) => key + 1)}
        onCancel={() => navigate('/products')}
        onSubmit={handleUpdate}
        apiError={apiError}
      />
    </div>
  )
}

export default EditProduct