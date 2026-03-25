import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../data/supabase';
import { ArrowLeft, FileText, FileDown, ShieldCheck } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchProducts();
      setProduct(data.find(p => p.id === id));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading product details...</div>;
  if (!product) return <div className="p-8 flex justify-center"><div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl font-medium border border-red-100">Product not found.</div></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-lg border shadow-sm">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-6">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <img src={product.images[0] || 'https://via.placeholder.com/800x600'} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button key={idx} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors bg-slate-50">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          <div>
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 rounded-full">
              {product.categories?.name}
            </div>
            <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{product.brands.name}</div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{product.name}</h1>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-between shadow-inner">
            <div>
              <div className="text-sm text-blue-800 font-semibold tracking-wide uppercase mb-1">Base Price Estimate</div>
              <div className="text-3xl font-bold text-blue-900 drop-shadow-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_per_m2)} <span className="text-lg font-medium text-blue-700/80">/ m²</span>
              </div>
            </div>
            <Link to={`/quotes?product=${product.id}`} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
              <FileText className="w-5 h-5" />
              Tạo Báo Giá
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 flex-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Technical Specs</h3>
              <dl className="space-y-3">
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500 capitalize">{key.replace('_', ' ')}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Certifications</h3>
              <ul className="space-y-3">
                {product.certifications?.map(cert => (
                  <li key={cert} className="flex items-center gap-2.5 text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <ShieldCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 mt-auto">
             <button className="flex items-center justify-center w-full gap-2 py-3 text-slate-700 font-medium hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors">
               <FileDown className="w-5 h-5" />
               Download Technical Data Sheet (TDS)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
