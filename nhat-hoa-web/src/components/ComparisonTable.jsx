'use client';

import { useStore } from '../store/useStore';
import { X, Trophy, Zap } from 'lucide-react';

export default function ComparisonTable() {
  const { compareList, toggleCompare, clearCompare } = useStore();

  if (compareList.length === 0) return null;

  // Find the highest PP Score
  const highestPP = Math.max(...compareList.map(p => p.pp_score));

  // Collect all unique dynamic specs keys
  const allSpecKeys = Array.from(new Set(
    compareList.flatMap(p => Object.keys(p.dynamic_specs || {}))
  ));

  return (
    <div className="bg-white rounded-3xl border border-blue-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Compare Products ({compareList.length}/4)
        </h2>
        <button 
          onClick={clearCompare}
          className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-r border-slate-100 w-48 bg-slate-50">Feature</th>
              {compareList.map(p => (
                <th key={p.id} className="p-4 min-w-[280px] border-r border-slate-100 relative align-top">
                  <button 
                    onClick={() => toggleCompare(p)}
                    className="absolute top-4 right-4 p-1.5 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img src={p.images[0]} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-200" />
                  <h3 className="font-extrabold text-slate-900 leading-tight">{p.name}</h3>
                  <p className="text-xs font-bold text-blue-600 mt-1">{p.brand}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50">Price / m²</td>
              {compareList.map(p => (
                <td key={p.id} className="p-4 border-r border-slate-100 font-bold text-slate-900 text-lg">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50">Install Cost</td>
              {compareList.map(p => (
                <td key={p.id} className="p-4 border-r border-slate-100 font-semibold text-slate-700">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.installation_cost)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50">P/P Score</td>
              {compareList.map(p => (
                <td key={p.id} className="p-4 border-r border-slate-100">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold ${p.pp_score === highestPP ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {p.pp_score === highestPP && <Trophy className="w-4 h-4 text-emerald-600" />}
                    {p.pp_score}/10
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50">Install Time</td>
              {compareList.map(p => (
                <td key={p.id} className="p-4 border-r border-slate-100 font-medium text-slate-800">
                  {p.installation_time}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600 bg-slate-50">Colors</td>
              {compareList.map(p => (
                <td key={p.id} className="p-4 border-r border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {p.colors.map(c => <span key={c} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{c}</span>)}
                  </div>
                </td>
              ))}
            </tr>
            {/* Dynamic Specs */}
            {allSpecKeys.map(key => (
              <tr key={key}>
                <td className="p-4 font-bold text-slate-600 bg-slate-50">{key}</td>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-r border-slate-100 text-slate-700 font-medium">
                    {p.dynamic_specs[key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
