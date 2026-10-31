import { describe, expect, it } from 'vitest'
import { buildUserPatch, validateImageUrl, validateName } from './user-patch.js'

const user = { id: 'u1', email: 'a@b.c', firstName: 'Asha', lastName: null, displayName: 'Asha K', profileImageUrl: null, status: 'ACTIVE' }
const same = { firstName: 'Asha', lastName: '', displayName: 'Asha K', profileImageUrl: '', status: 'ACTIVE' }

describe('buildUserPatch', () => {
  it('is empty when nothing changed', () => {
    expect(buildUserPatch(user, same)).toEqual({})
  })

  it('sends only changed fields, never read-only ones', () => {
    expect(buildUserPatch(user, { ...same, firstName: ' Asha M ', status: 'SUSPENDED', email: 'x@y.z' })).toEqual({
      firstName: 'Asha M',
      status: 'SUSPENDED',
    })
  })

  it('sends null when a populated field is cleared', () => {
    expect(buildUserPatch(user, { ...same, displayName: '  ' })).toEqual({ displayName: null })
  })

  it('never sends status for deleted users', () => {
    expect(buildUserPatch({ ...user, status: 'DELETED' }, { ...same, status: 'ACTIVE' })).toEqual({})
  })
})

describe('validators', () => {
  it('limits names to 255 chars', () => {
    expect(validateName('a'.repeat(255))).toBe(true)
    expect(validateName('a'.repeat(256))).not.toBe(true)
  })

  it('accepts blank and http(s) URLs only', () => {
    expect(validateImageUrl('')).toBe(true)
    expect(validateImageUrl('https://x.test/a.png')).toBe(true)
    expect(validateImageUrl('ftp://x.test/a.png')).not.toBe(true)
    expect(validateImageUrl('nope')).not.toBe(true)
    expect(validateImageUrl(`https://x.test/${'a'.repeat(2048)}`)).not.toBe(true)
  })
})
