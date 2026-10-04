import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'

function CmsLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-5 sm:p-8 lg:p-10">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}

export default CmsLayout