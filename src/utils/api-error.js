// Normalises the backend's three error shapes into { status, code, message }.
export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  const response = error?.response
  if (!response) {
    return { status: null, code: 'NETWORK_ERROR', message: 'Unable to reach the server.' }
  }

  const { status, data } = response
  const body = data && typeof data === 'object' ? data : {}

  if (status === 401) {
    return { status, code: 'UNAUTHORIZED', message: 'Your authentication has expired. Please authenticate again.' }
  }

  if (status === 403 || body.error === 'insufficient_scope') {
    return {
      status: 403,
      code: 'INSUFFICIENT_SCOPE',
      message: 'You do not have permission to perform this action.',
    }
  }

  const message = typeof body.message === 'string' && body.message.trim() ? body.message : fallback
  return { status, code: typeof body.code === 'string' ? body.code : undefined, message }
}
