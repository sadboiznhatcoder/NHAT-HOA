import { useState, useEffect } from 'react';
import { fetchProducts } from '../../data/supabase';
import { GitCompare, X } from 'lucide-react';

export default function Comparison() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchProducts();
      setProducts(data);
      if (data.length > 0) setSelectedIds([data[0].id, data[1]?.id].filter(Boolean));
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (e) => {
    const id = e.target.value;
    if (!id) return;
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 3) {
      alert('You can only compare up to 3 products at a time.');
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const removeProduct = (idToRemove) => {
    setSelectedIds(selectedIds.filter(id => id !== idToRemove));
  };

  const selectedProducts = selectedIds.map(id => products.find(p => p.id === id)).filter(Boolean);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading comparison data...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GitCompare className="w-6 h-6 text-blue-600" />
          </div>
          Comparison Tool
        </h2>
        <p className="text-slate-500 mt-2 text-lg">Select up to 3 flooring products to compare technical specifications side-by-side.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Add Product to Compare:</label>
        <select 
          className="w-full md:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none cursor-pointer"
          onChange={handleSelect}
          value=""
        >
          <option value="" disabled>-- Select a flooring product from the library --</option>
          {products.map(p => (
            <option key={p.id} value={p.id} disabled={selectedIds.includes(p.id)}>{p.name} ({p.brands.name})</option>
          ))}
        </select>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-6 border-b border-r border-slate-200 bg-slate-50 w-1/4 align-bottom">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Features</div>
                </th>
                {selectedProducts.map(p => (
                  <th key={p.id} className="p-6 border-b border-r border-slate-200 w-1/4 align-top relative group">
                    <button onClick={() => removeProduct(p.id)} className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-200/50">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-200">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-1">{p.brands.name}</div>
                    <div className="text-xl font-bold text-slate-900 leading-tight">{p.name}</div>
                  </th>
                ))}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-6 border-b border-r border-slate-200 bg-slate-50/50 w-1/4 text-center align-middle">
                    <div className="text-slate-400 font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl p-8">
                      + Add another to compare
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">Category</td>
                {selectedProducts.map(p => <td key={p.id} className="p-5 border-r border-slate-200 text-slate-800">{p.categories.name}</td>)}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => <td key={`empty-c-${i}`} className="p-5 border-r border-slate-200"></td>)}
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">Base Price</td>
                {selectedProducts.map(p => <td key={p.id} className="p-5 border-r border-slate-200 font-bold text-blue-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price_per_m2)} <span className="text-xs font-normal text-slate-500">/ m²</span></td>)}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => <td key={`empty-p-${i}`} className="p-5 border-r border-slate-200"></td>)}
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">Thickness</td>
                {selectedProducts.map(p => <td key={p.id} className="p-5 border-r border-slate-200 text-slate-800">{p.specs?.thickness || 'N/A'}</td>)}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => <td key={`empty-t-${i}`} className="p-5 border-r border-slate-200"></td>)}
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">Material</td>
                {selectedProducts.map(p => <td key={p.id} className="p-5 border-r border-slate-200 text-slate-800">{p.specs?.material || 'N/A'}</td>)}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => <td key={`empty-m-${i}`} className="p-5 border-r border-slate-200"></td>)}
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-5 border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">Certifications</td>
                {selectedProducts.map(p => (
                  <td key={p.id} className="p-5 border-r border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {p.certifications?.map(c => <span key={c} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-200">{c}</span>) || 'None'}
                    </div>
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, i) => <td key={`empty-cert-${i}`} className="p-5 border-r border-slate-200"></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
