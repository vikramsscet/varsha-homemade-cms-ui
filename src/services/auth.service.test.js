import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api.js'
import { requestAccessToken } from './auth.service.js'

vi.mock('./api.js', () => ({
  default: { post: vi.fn() },
}))

describe('requestAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts client credentials as form-encoded data to the OAuth token endpoint', () => {
    requestAccessToken('cms-client', 'test-secret')

    expect(api.post).toHaveBeenCalledOnce()
    const [url, body, config] = api.post.mock.calls[0]
    expect(url).toBe('/oauth/token')
    expect(body).toBeInstanceOf(URLSearchParams)
    expect(body.toString()).toBe(
      'grant_type=client_credentials&client_id=cms-client&client_secret=test-secret',
    )
    expect(config).toEqual({
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  })
})