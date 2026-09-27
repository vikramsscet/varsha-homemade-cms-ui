import { Folder, LayoutDashboard, Package } from 'lucide-react'

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Categories', icon: Folder, active: false },
  { label: 'Products', icon: Package, active: false },
]

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-40 shrink-0 flex-col border-r border-border bg-surface px-3 py-6 sm:w-56 sm:px-4 lg:w-60">
      <div className="border-b border-border px-2 pb-6">
        <p className="text-base font-semibold leading-tight text-text">
          Varsha Homemade
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
          CMS
        </p>
      </div>

      <nav aria-label="Main navigation" className="mt-6 space-y-1">
        {navigationItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
              active
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted hover:bg-background hover:text-text'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar