function StatCard({ title, value, icon: Icon, loading, error }) {
  return (
    <article className="min-h-40 rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid size-9 place-items-center rounded-md bg-background text-primary">
            <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
          </span>
        )}
        <h2 className="text-sm font-medium text-muted">{title}</h2>
      </div>
      <p className="mt-6 min-h-9 text-3xl font-semibold text-text" aria-live="polite">
        {loading ? (
          <span className="text-base font-normal text-muted">Loading...</span>
        ) : error ? (
          <span className="text-base font-normal text-error">Unable to load</span>
        ) : (
          value
        )}
      </p>
    </article>
  )
}

export default StatCard