import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Authenticate() {
  const { authenticate, authExpired } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showSecret, setShowSecret] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { clientId: '', clientSecret: '' } })

  const onSubmit = async ({ clientId, clientSecret }) => {
    setStatusMessage('')
    try {
      await authenticate(clientId, clientSecret)
      setStatusMessage('Authentication successful.')
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch {
      setStatusMessage('Unable to authenticate. Check your credentials and try again.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-text">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Varsha Homemade</p>
          <h1 className="text-2xl font-semibold">Connect to your CMS</h1>
          <p className="text-sm leading-6 text-muted">Enter your client credentials to continue.</p>
        </div>

        {authExpired && (
          <p className="mb-5 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-text" role="alert">
            Your authentication has expired. Please authenticate again.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="client-id" className="block text-sm font-medium">Client ID</label>
            <input
              id="client-id"
              type="text"
              autoComplete="username"
              aria-invalid={Boolean(errors.clientId)}
              aria-describedby={errors.clientId ? 'client-id-error' : undefined}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              {...register('clientId', { required: 'Client ID is required.' })}
            />
            {errors.clientId && (
              <p id="client-id-error" className="text-sm text-error" role="alert">
                {errors.clientId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="client-secret" className="block text-sm font-medium">Client Secret</label>
            <div className="relative">
              <input
                id="client-secret"
                type={showSecret ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.clientSecret)}
                aria-describedby={errors.clientSecret ? 'client-secret-error' : undefined}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                {...register('clientSecret', { required: 'Client Secret is required.' })}
              />
              <button
                type="button"
                onClick={() => setShowSecret((visible) => !visible)}
                aria-label={showSecret ? 'Hide Client Secret' : 'Show Client Secret'}
                aria-pressed={showSecret}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showSecret
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {errors.clientSecret && (
              <p id="client-secret-error" className="text-sm text-error" role="alert">
                {errors.clientSecret.message}
              </p>
            )}
          </div>

          {statusMessage && <p className="text-sm text-muted" role="status">{statusMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            )}
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Authenticate