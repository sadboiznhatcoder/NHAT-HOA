'use client';

import SidebarFilters from '../components/SidebarFilters';
import ProductCard from '../components/ProductCard';
import AiChatWidget from '../components/AiChatWidget';
import ComparisonTable from '../components/ComparisonTable';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { filteredProducts, compareList } = useStore();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Left Sidebar: Filters */}
      <SidebarFilters />
      
      {/* Main Content: Products & Comparison */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col relative">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Nhật Hoa Flooring Hub</h1>
            <p className="text-slate-500 mt-2 text-lg">Internal catalog with price/performance analytics.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-bold text-blue-700">
            {filteredProducts.length} Results
          </div>
        </div>

        {compareList.length > 0 && (
          <div className="mb-8">
            <ComparisonTable />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-500 text-lg">No products match the selected filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel / Floating Widget: AI Chat */}
      <AiChatWidget />
    </div>
  );
}
