import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CmsLayout from '../layouts/CmsLayout.jsx'
import Categories from '../pages/categories/Categories.jsx'
import CreateCategory from '../pages/categories/CreateCategory.jsx'
import EditCategory from '../pages/categories/EditCategory.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import CreateProduct from '../pages/products/CreateProduct.jsx'
import EditProduct from '../pages/products/EditProduct.jsx'
import Products from '../pages/products/Products.jsx'
import Authenticate from '../pages/Authenticate.jsx'
import RequireAuth from '../components/RequireAuth.jsx'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authenticate" element={<Authenticate />} />
        <Route element={<CmsLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/new" element={<RequireAuth><CreateCategory /></RequireAuth>} />
          <Route path="/categories/:id/edit" element={<RequireAuth><EditCategory /></RequireAuth>} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<RequireAuth><CreateProduct /></RequireAuth>} />
          <Route path="/products/:id/edit" element={<RequireAuth><EditProduct /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes