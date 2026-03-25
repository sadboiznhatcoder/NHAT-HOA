import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import Comparison from './pages/Products/Comparison';
import AIFilter from './pages/AIFilter';
import QuoteGenerator from './pages/Quotes/QuoteGenerator';
import Settings from './pages/Settings';
import AdminProducts from './pages/Admin/AdminProducts';
import ProductFormPage from './pages/Admin/ProductFormPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="compare" element={<Comparison />} />
          <Route path="ai-filter" element={<AIFilter />} />
          <Route path="quotes" element={<QuoteGenerator />} />
          <Route path="settings" element={<Settings />} />
          
          <Route path="admin/products" element={<AdminProducts />} />
          <Route path="admin/products/new" element={<ProductFormPage />} />
          <Route path="admin/products/:id/edit" element={<ProductFormPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
