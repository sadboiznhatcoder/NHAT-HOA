'use client';

import { useStore } from '../store/useStore';

const BRANDS = ['Gerflor', 'KCC', 'EcoWeave', 'Tarkett'];
const APPLICATIONS = ['Bệnh viện', 'Phòng khám', 'Trường học', 'Phòng sạch', 'Nhà máy', 'Kho xưởng', 'Nhà hàng', 'Văn phòng', 'Sân thể thao'];
const COLORS = ['Xanh lam', 'Xanh lá', 'Xám nhạt', 'Xám ghi', 'Trắng sữa', 'Vàng', 'Đen', 'Xám', 'Đỏ mận', 'Cam', 'Vân gỗ'];
const TIME = ['Nhanh', 'Trung bình', 'Chậm'];

const FilterGroup = ({ title, options, category }) => {
  const { filters, setFilter } = useStore();
  const selected = filters[category];

  return (
    <div className="mb-6">
      <h3 className="font-bold text-slate-800 mb-3">{title}</h3>
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
              {selected.includes(opt) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900 transition-colors">{opt}</span>
            <input type="checkbox" className="hidden" checked={selected.includes(opt)} onChange={() => setFilter(category, opt)} />
          </label>
        ))}
      </div>
    </div>
  );
};

export default function SidebarFilters() {
  const { filters, setPriceRange } = useStore();

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-10 shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Filters</h2>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1">
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3">Khoảng Giá / m²</h3>
          <input 
            type="range" 
            min="0" 
            max="1000000" 
            step="50000" 
            value={filters.priceRange[1]} 
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
            <span>0₫</span>
            <span className="text-blue-700">{new Intl.NumberFormat('vi-VN').format(filters.priceRange[1])}₫</span>
          </div>
        </div>

        <FilterGroup title="Thương hiệu" options={BRANDS} category="brands" />
        <FilterGroup title="Loại công trình" options={APPLICATIONS} category="applications" />
        <FilterGroup title="Thời gian thi công" options={TIME} category="installTimes" />
        <FilterGroup title="Màu sắc" options={COLORS} category="colors" />
      </div>
    </aside>
  );
}
