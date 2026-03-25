import { create } from 'zustand';
import { mockProducts } from '../lib/mockData';

export const useStore = create((set, get) => ({
  products: mockProducts,
  filteredProducts: mockProducts,
  
  // Filter States
  filters: {
    brands: [],
    applications: [],
    colors: [],
    priceRange: [0, 2000000],
    installTimes: []
  },

  // Compare States
  compareList: [],

  // Actions
  setFilter: (category, value) => {
    set((state) => {
      const currentFilters = state.filters[category];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value];
      
      const updatedFilters = { ...state.filters, [category]: newFilters };
      return { filters: updatedFilters };
    });
    get().applyFilters();
  },

  setPriceRange: (range) => {
    set((state) => ({ ...state, filters: { ...state.filters, priceRange: range } }));
    get().applyFilters();
  },

  applyFilters: () => {
    set((state) => {
      const { brands, applications, colors, priceRange, installTimes } = state.filters;
      
      const filtered = state.products.filter(product => {
        // Price Filter
        if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

        // Multi-select filters
        if (brands.length > 0 && !brands.includes(product.brand)) return false;
        
        let appMatch = applications.length === 0;
        if (!appMatch) {
            for (let app of product.applications) {
                if (applications.includes(app)) { appMatch = true; break;}
            }
        }
        if (!appMatch) return false;

        let colorMatch = colors.length === 0;
        if (!colorMatch) {
            for (let c of product.colors) {
                if (colors.includes(c)) { colorMatch = true; break;}
            }
        }
        if (!colorMatch) return false;

        if (installTimes.length > 0) {
            let speed = 'Trung bình';
            if (product.installation_time.includes('1 ngày') || product.installation_time.includes('2 ngày')) speed = 'Nhanh';
            if (product.installation_time.includes('4 ngày')) speed = 'Chậm';
            if (!installTimes.includes(speed)) return false;
        }

        return true;
      });
      
      return { filteredProducts: filtered };
    });
  },

  toggleCompare: (product) => {
    set((state) => {
      const existing = state.compareList.find(p => p.id === product.id);
      if (existing) {
        return { compareList: state.compareList.filter(p => p.id !== product.id) };
      }
      if (state.compareList.length >= 4) {
        alert("You can only compare up to 4 products.");
        return state;
      }
      return { compareList: [...state.compareList, product] };
    });
  },

  clearCompare: () => set({ compareList: [] })
}));
