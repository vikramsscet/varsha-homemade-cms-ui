function ConfirmDialog({ title, children, confirmLabel, busyLabel, busy, error, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-text/40 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <div className="mt-2 text-sm text-muted">{children}</div>
        {error && <p className="mt-4 text-sm text-error" role="alert">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-error px-3 py-2 text-sm font-medium text-white hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
