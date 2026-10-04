import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function ApiResponseHandler() {
  const { authExpired, apiMessage, clearApiMessage } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (authExpired && location.pathname !== '/authenticate') {
      navigate('/authenticate', {
        replace: true,
        state: { from: location },
      })
    }
  }, [authExpired, location, navigate])

  return apiMessage ? (
    <div
      role="alert"
      className="fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-md border border-error/30 bg-surface px-4 py-3 text-sm text-text shadow-lg"
    >
      <span>{apiMessage}</span>
      <button
        type="button"
        onClick={clearApiMessage}
        aria-label="Dismiss notification"
        className="grid size-7 shrink-0 place-items-center rounded text-muted hover:bg-background hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  ) : null
}

export default ApiResponseHandler