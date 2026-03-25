'use client';

import { useStore } from '../store/useStore';
import { GitCompare, Zap, Wrench } from 'lucide-react';

export default function ProductCard({ product }) {
  const { compareList, toggleCompare } = useStore();
  const isCompared = compareList.some(p => p.id === product.id);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
      <div className="h-56 overflow-hidden relative bg-slate-100">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-blue-700">
            {product.brand}
          </div>
          <div className="bg-emerald-500/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-white flex items-center gap-1">
            <Zap className="w-3 h-3" /> P/P: {product.pp_score}/10
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-3 line-clamp-2">{product.name}</h3>
        
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Vật tư:</span>
            <span className="text-lg font-bold text-slate-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
          </div>
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Thi công:</span>
            <span className="font-semibold text-slate-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.installation_cost)}</span>
          </div>
          <div className="flex justify-between items-end pt-1">
            <span className="text-slate-500 font-medium flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Thời gian:</span>
            <span className="font-bold text-blue-600">{product.installation_time}</span>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => toggleCompare(product)}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isCompared 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            <GitCompare className="w-5 h-5" />
            {isCompared ? 'Added to Compare' : 'So sánh'}
          </button>
        </div>
      </div>
    </div>
  );
}
