import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CmsLayout from '../layouts/CmsLayout.jsx'
import Categories from '../pages/categories/Categories.jsx'
import CreateCategory from '../pages/categories/CreateCategory.jsx'
import EditCategory from '../pages/categories/EditCategory.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import CreateProduct from '../pages/products/CreateProduct.jsx'
import EditProduct from '../pages/products/EditProduct.jsx'
import Products from '../pages/products/Products.jsx'

function AppRoutes() {
  return (
    <BrowserRouter>
      <CmsLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/new" element={<CreateCategory />} />
          <Route path="/categories/:id/edit" element={<EditCategory />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<CreateProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </CmsLayout>
    </BrowserRouter>
  )
}

export default AppRoutes