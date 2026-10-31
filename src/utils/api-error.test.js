import { describe, expect, it } from 'vitest'
import { parseApiError } from './api-error.js'

const failure = (status, data) => ({ response: { status, data } })

describe('parseApiError', () => {
  it('handles the 401 shape', () => {
    expect(parseApiError(failure(401, { statusCode: 401, message: 'Unauthorized' }))).toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('handles the 403 insufficient_scope shape', () => {
    expect(parseApiError(failure(403, { error: 'insufficient_scope', error_description: 'x' }))).toMatchObject({ status: 403, code: 'INSUFFICIENT_SCOPE' })
  })

  it('exposes code and message for other errors', () => {
    expect(parseApiError(failure(404, { statusCode: 404, message: 'No such user', code: 'USER_NOT_FOUND' }))).toEqual({
      status: 404, code: 'USER_NOT_FOUND', message: 'No such user',
    })
  })

  it('reports network failures and falls back when there is no message', () => {
    expect(parseApiError(new Error('boom')).code).toBe('NETWORK_ERROR')
    expect(parseApiError(failure(500, null), 'fallback').message).toBe('fallback')
  })
})
