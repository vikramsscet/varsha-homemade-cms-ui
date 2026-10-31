const styles = {
  ACTIVE: 'bg-success/10 text-success',
  SUSPENDED: 'bg-warning/10 text-warning',
  DELETED: 'bg-background text-muted',
}

export function userLabel(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return user.displayName || fullName || user.email
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN')
}

function UserStatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.DELETED}`}>
      {status}
    </span>
  )
}

export default UserStatusBadge
