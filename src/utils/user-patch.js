export const NAME_FIELDS = ['firstName', 'lastName', 'displayName']

export function validateName(value) {
  return String(value ?? '').trim().length > 255 ? 'Must be 255 characters or fewer.' : true
}

export function validateImageUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return true
  if (text.length > 2048) return 'Must be 2048 characters or fewer.'
  try {
    const { protocol } = new URL(text)
    return protocol === 'http:' || protocol === 'https:' ? true : 'Must be an http(s) URL.'
  } catch {
    return 'Must be a valid http(s) URL.'
  }
}

// Builds a PATCH body containing only the editable fields the admin changed.
// Blank text becomes null; email, id, timestamps and the like are never included.
export function buildUserPatch(user, values) {
  const patch = {}

  for (const field of [...NAME_FIELDS, 'profileImageUrl']) {
    const next = String(values[field] ?? '').trim() || null
    if (next !== (user[field] ?? null)) patch[field] = next
  }

  if (user.status !== 'DELETED' && values.status && values.status !== user.status) {
    patch.status = values.status
  }

  return patch
}
