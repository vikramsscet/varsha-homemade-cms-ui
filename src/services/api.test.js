import { afterEach, describe, expect, it, vi } from 'vitest'
import api from './api.js'
import { clearAccessToken, setAccessToken } from './access-token.js'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from './product.service.js'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from './category.service.js'
import { requestAccessToken } from './auth.service.js'

const originalAdapter = api.defaults.adapter
let sentRequests

afterEach(() => {
  api.defaults.adapter = originalAdapter
  clearAccessToken()
  vi.restoreAllMocks()
})

function captureRequests() {
  sentRequests = []
  api.defaults.adapter = vi.fn(async (config) => {
    sentRequests.push(config)
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  })
}

describe('API authorization interceptor', () => {
  it('attaches the in-memory Bearer token to every product and category operation', async () => {
    captureRequests()
    setAccessToken('test-access-token')

    await Promise.all([
      getProducts(),
      createProduct({ title: 'Product' }),
      updateProduct('product-1', { title: 'Updated product' }),
      deleteProduct('product-1'),
      getCategories(),
      createCategory({ name: 'Category' }),
      updateCategory('category-1', { name: 'Updated category' }),
      deleteCategory('category-1'),
    ])

    expect(sentRequests).toHaveLength(8)
    expect(sentRequests.map(({ method, url }) => [method.toUpperCase(), url])).toEqual([
      ['GET', '/products'],
      ['POST', '/products'],
      ['PATCH', '/products/product-1'],
      ['DELETE', '/products/product-1'],
      ['GET', '/categories'],
      ['POST', '/categories'],
      ['PATCH', '/categories/category-1'],
      ['DELETE', '/categories/category-1'],
    ])
    for (const request of sentRequests) {
      expect(request.headers.get('Authorization')).toBe('Bearer test-access-token')
    }
  })

  it('does not add Authorization when there is no access token', async () => {
    captureRequests()

    await getProducts()

    expect(sentRequests[0].headers.has('Authorization')).toBe(false)
  })

  it('does not add Authorization to the OAuth token request', async () => {
    captureRequests()
    setAccessToken('test-access-token')

    await requestAccessToken('client-id', 'client-secret')

    expect(sentRequests[0].url).toBe('/oauth/token')
    expect(sentRequests[0].headers.has('Authorization')).toBe(false)
  })
})