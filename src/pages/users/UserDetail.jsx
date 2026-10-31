import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, ShoppingCart } from 'lucide-react'
import { deleteUser, getUser, updateUser } from '../../services/user.service.js'
import { parseApiError } from '../../utils/api-error.js'
import { buildUserPatch, validateImageUrl, validateName } from '../../utils/user-patch.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import UserStatusBadge, { formatDateTime, userLabel } from '../../components/users/UserStatusBadge.jsx'

const inputClass = 'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-background disabled:text-muted'

function toFormValues(user) {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    displayName: user.displayName ?? '',
    profileImageUrl: user.profileImageUrl ?? '',
    status: user.status,
  }
}

function ReadOnlyField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted">{label}</dt>
      <dd className="mt-1 break-all text-sm text-text">{children}</dd>
    </div>
  )
}

function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { firstName: '', lastName: '', displayName: '', profileImageUrl: '', status: 'ACTIVE' } })

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setLoadError('')

    async function loadUser() {
      try {
        const response = await getUser(id)
        if (!response.data || typeof response.data !== 'object') throw new Error('Unexpected user response')
        if (isCurrent) {
          setUser(response.data)
          reset(toFormValues(response.data))
        }
      } catch (requestError) {
        if (isCurrent) setLoadError(parseApiError(requestError, 'Unable to load user.').message)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadUser()

    return () => {
      isCurrent = false
    }
  }, [id, refreshKey, reset])

  const applyUpdatedUser = (updated) => {
    setUser(updated)
    reset(toFormValues(updated))
  }

  const onSubmit = async (values) => {
    setSaveError('')
    setSuccessMessage('')
    const patch = buildUserPatch(user, values)

    if (Object.keys(patch).length === 0) {
      setEditing(false)
      return
    }

    try {
      const response = await updateUser(user.id, patch)
      applyUpdatedUser(response.data)
      setEditing(false)
      setSuccessMessage('User updated successfully.')
    } catch (requestError) {
      setSaveError(parseApiError(requestError, 'Unable to update user.').message)
    }
  }

  const handleStatusChange = async (status) => {
    setIsChangingStatus(true)
    setSaveError('')
    setSuccessMessage('')

    try {
      const response = await updateUser(user.id, { status })
      applyUpdatedUser(response.data)
      setSuccessMessage(status === 'SUSPENDED' ? 'User suspended.' : 'User reactivated.')
    } catch (requestError) {
      setSaveError(parseApiError(requestError, 'Unable to change user status.').message)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteUser(user.id)
      setConfirmDelete(false)
      setEditing(false)
      setUser((current) => ({ ...current, status: 'DELETED' }))
      setSuccessMessage('User deleted. The account is soft-deleted and the active cart was abandoned.')
    } catch (requestError) {
      setDeleteError(parseApiError(requestError, 'Unable to delete user.').message)
    } finally {
      setIsDeleting(false)
    }
  }

  const isDeleted = user?.status === 'DELETED'

  return (
    <>
      <div className="space-y-6" aria-hidden={confirmDelete} inert={confirmDelete ? '' : undefined}>
        <Link to="/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to users
        </Link>

        {loading ? (
          <div className="min-h-48 rounded-lg border border-border bg-surface p-6 text-sm text-muted" role="status">
            Loading user...
          </div>
        ) : loadError || !user ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-4 rounded-lg border border-border bg-surface p-6">
            <p className="text-sm text-error" role="alert">{loadError || 'Unable to load user.'}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background"
            >
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-text sm:text-3xl">{userLabel(user)}</h1>
                <UserStatusBadge status={user.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/users/${user.id}/cart`}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background"
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  View cart
                </Link>
                {user.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('SUSPENDED')}
                    disabled={isChangingStatus || editing}
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Suspend
                  </button>
                )}
                {user.status === 'SUSPENDED' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isChangingStatus || editing}
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSaveError('')
                    setSuccessMessage('')
                    setEditing(true)
                  }}
                  disabled={isDeleted || editing}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('')
                    setConfirmDelete(true)
                  }}
                  disabled={isDeleted}
                  className="rounded-md border border-error/40 bg-surface px-3 py-2 text-sm font-medium text-error hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            {isDeleted && (
              <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted">
                This user has been deleted and can no longer be edited.
              </p>
            )}
            {successMessage && (
              <div className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success" role="status">
                {successMessage}
              </div>
            )}
            {saveError && !editing && (
              <p className="rounded-md border border-error/20 bg-error/5 px-3 py-2 text-sm text-error" role="alert">{saveError}</p>
            )}

            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="User ID">{user.id}</ReadOnlyField>
                <ReadOnlyField label="Email">{user.email}</ReadOnlyField>
                <ReadOnlyField label="Email verified">{user.emailVerified ? 'Yes' : 'No'}</ReadOnlyField>
                <ReadOnlyField label="Last login">{formatDateTime(user.lastLoginAt)}</ReadOnlyField>
                <ReadOnlyField label="Created">{formatDateTime(user.createdAt)}</ReadOnlyField>
                <ReadOnlyField label="Updated">{formatDateTime(user.updatedAt)}</ReadOnlyField>
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-text">Profile</h2>
              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  {[
                    ['firstName', 'First name'],
                    ['lastName', 'Last name'],
                    ['displayName', 'Display name'],
                  ].map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <label htmlFor={`user-${field}`} className="block text-sm font-medium">{label}</label>
                      <input
                        id={`user-${field}`}
                        type="text"
                        aria-invalid={Boolean(errors[field])}
                        className={inputClass}
                        {...register(field, { validate: validateName })}
                      />
                      {errors[field] && <p className="text-sm text-error" role="alert">{errors[field].message}</p>}
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label htmlFor="user-profileImageUrl" className="block text-sm font-medium">Profile image URL</label>
                    <input
                      id="user-profileImageUrl"
                      type="text"
                      aria-invalid={Boolean(errors.profileImageUrl)}
                      className={inputClass}
                      {...register('profileImageUrl', { validate: validateImageUrl })}
                    />
                    {errors.profileImageUrl && (
                      <p className="text-sm text-error" role="alert">{errors.profileImageUrl.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="user-status" className="block text-sm font-medium">Status</label>
                    <select id="user-status" className={inputClass} {...register('status')}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>

                  {saveError && <p className="text-sm text-error" role="alert">{saveError}</p>}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        reset(toFormValues(user))
                        setSaveError('')
                        setEditing(false)
                      }}
                      disabled={isSubmitting}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="First name">{user.firstName || '—'}</ReadOnlyField>
                  <ReadOnlyField label="Last name">{user.lastName || '—'}</ReadOnlyField>
                  <ReadOnlyField label="Display name">{user.displayName || '—'}</ReadOnlyField>
                  <ReadOnlyField label="Profile image">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="size-16 rounded-md border border-border object-cover" />
                    ) : '—'}
                  </ReadOnlyField>
                </dl>
              )}
            </section>
          </>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete user?"
          confirmLabel="Delete user"
          busyLabel="Deleting..."
          busy={isDeleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => {
            setConfirmDelete(false)
            setDeleteError('')
          }}
        >
          <p>
            "{userLabel(user)}" will be soft-deleted: the account is marked as deleted and the
            user's active cart is abandoned.
          </p>
        </ConfirmDialog>
      )}
    </>
  )
}

export default UserDetail
