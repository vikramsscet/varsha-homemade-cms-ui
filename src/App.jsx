import CmsLayout from './layouts/CmsLayout.jsx'

function App() {
  return (
    <CmsLayout>
      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Welcome to Varsha Homemade CMS.
        </p>
      </div>
    </CmsLayout>
  )
}

export default App
