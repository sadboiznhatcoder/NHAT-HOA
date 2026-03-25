import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../data/supabase';
import { Search, Filter, AlertCircle } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brands.name.toLowerCase().includes(q) ||
      p.categories.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading product library...</div>;
  if (error) return <div className="p-8 text-center text-red-500 flex justify-center items-center gap-2"><AlertCircle /> Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Library</h2>
          <p className="text-slate-500 text-sm mt-1">Browse and search the entire flooring catalog</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand, type (e.g., Vinyl, Epoxy), or name..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Link to={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
               <img 
                 src={product.images[0] || 'https://via.placeholder.com/400x300'} 
                 alt={product.name} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               />
               <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded shadow-sm text-slate-800">
                 {product.categories.name}
               </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="text-xs font-semibold text-blue-600 mb-1">{product.brands.name}</div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{product.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{product.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-slate-500">Thickness: </span>
                  <span className="font-medium text-slate-700">{product.specs?.thickness || 'N/A'}</span>
                </div>
                <div className="text-primary font-semibold text-slate-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_per_m2)} / m²
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            No products found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
}
