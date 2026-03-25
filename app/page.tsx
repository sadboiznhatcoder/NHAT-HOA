"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X, Sparkles, Loader2, Heart, MessageCircle, Sun, Moon, Filter, ShieldCheck, Settings, Scale, Check, Plus, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "../lib/supabaseClient";
import ReactMarkdown from "react-markdown";

type FilterState = {
  brand: string[];
  category: string[];
  thickness: string[];
  wearLayer: string[];
  type: string[];
  colorTone: string[];
  application: string[];
  installType: string[];
};

const hierarchyData = [
  {
     id: "VINYL",
     label: "Sàn VINYL",
     categoryMatch: "VINYL",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["Tarkett", "LG Hausys", "KDF", "Gerflor", "Responsive"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Kháng khuẩn", "Chống tĩnh điện", "Chịu lực cao", "Chống trơn trượt"] }
     ]
  },
  {
     id: "THẢM",
     label: "Thảm (Carpet)",
     categoryMatch: "THẢM (CARPET)",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["Suminoe", "Khác"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Thảm tấm (Carpet Tile)", "Thảm cuộn (Broadloom/Roll)", "Thảm viên"] }
     ]
  },
  {
     id: "SÀN_NÂNG",
     label: "Sàn Nâng (Access Floor)",
     categoryMatch: "SÀN NÂNG (ACCESS FLOOR)",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["NAKA CORP", "Yikuan", "Unitile"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Thép lõi xi măng (Cementitious)", "Gỗ ép (Woodcore)", "Nhôm đúc (Aluminum)", "Canxi Sunfat (Calcium Sulphate)"] }
     ]
  },
  {
     id: "SÀN_TỰ_PHẲNG",
     label: "Sàn Tự Phẳng",
     categoryMatch: "SÀN TỰ PHẲNG (EPOXY/PU)",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["Viacor", "Khác"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Sơn Epoxy", "Sơn Polyurethane (PU)"] }
     ]
  },
  {
     id: "CLEAN_ROOM",
     label: "Phòng Sạch (Clean Room)",
     categoryMatch: "PHÒNG SẠCH (CLEAN ROOM)",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["Beaver Panel", "Walltech"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Panel tường (Wall Panel)", "Panel trần (Ceiling Panel)", "Cửa phòng sạch (Cleanroom Door)", "Phụ kiện nhôm"] }
     ]
  },
  {
     id: "SÀN_ĐẶC_BIỆT",
     label: "Sàn Đặc Biệt Khác",
     categoryMatch: "SÀN ĐẶC BIỆT",
     filters: [
       { title: "Thương hiệu", key: "brand" as keyof FilterState, options: ["Khác"] },
       { title: "Hạng mục con", key: "type" as keyof FilterState, options: ["Sàn thể thao ngoài trời", "Sàn hèm khóa (SPC)", "Sàn cao su (Rubber)"] }
     ]
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    brand: [], category: [], thickness: [], wearLayer: [], type: [], colorTone: [], application: [], installType: []
  });
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["VINYL"]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareResult, setCompareResult] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    setMounted(true);
    const savedWishlist = localStorage.getItem("nhat_hoa_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    if (typeof window !== 'undefined') {
       const params = new URLSearchParams(window.location.search);
       setActiveFilters({
         brand: params.getAll('brand'),
         category: params.getAll('category'),
         thickness: params.getAll('thickness'),
         wearLayer: params.getAll('wearLayer'),
         type: params.getAll('type'),
         colorTone: params.getAll('colorTone'),
         application: params.getAll('application'),
         installType: params.getAll('installType')
       });
       if (Array.from(params.keys()).length > 0) setSearched(true);
    }

    const loadRealData = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setAllProducts(data);
    };
    loadRealData();
  }, []);

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = directQuery || query;
    if (!searchQuery.trim()) return;

    if (searchQuery.startsWith("POST ")) {
      setLoading(true);
      const rawText = searchQuery.trim().substring(4).trim();
      try {
        const res = await fetch("/api/ai-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText }),
        });
        const data = await res.json();
        if (data.success && data.insertedId) {
          window.location.href = `/admin?edit=${data.insertedId}`;
        } else {
          setAiResponse(`**Lỗi Cú pháp POST:** ${data.error || "Không thể phân tích dữ liệu, vui lòng thử lại."}`);
        }
      } catch (err) {
        setAiResponse("**Lỗi Kết nối:** Không thể truy cập AI Server.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setSearched(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, activeContext: allProducts }),
      });
      const data = await res.json();
      if (data.reply) setAiResponse(data.reply);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeAiComparison = async () => {
    if (compareList.length < 2) return;
    setIsComparing(true);
    setIsCompareModalOpen(true);
    setCompareResult("");

    try {
      const res = await fetch("/api/ai-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: compareList }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setCompareResult(data.result);
      } else {
        setCompareResult(data.error || "Có lỗi xảy ra trong quá trình phân tích.");
      }
    } catch (err: any) {
      setCompareResult("Lỗi kết nối AI: " + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newWishlist = wishlist.includes(id) 
        ? wishlist.filter(itemId => itemId !== id)
        : [...wishlist, id];
    setWishlist(newWishlist);
    localStorage.setItem("nhat_hoa_wishlist", JSON.stringify(newWishlist));
  };

  const toggleCompare = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const exists = compareList.find(p => p.id === product.id);
    if (exists) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert("Chỉ so sánh tối đa 3 sản phẩm cùng lúc để đảm bảo độ chính xác!");
        return;
      }
      setCompareList(prev => [...prev, product]);
    }
  };

  const handleFilterToggle = (categoryKey: keyof FilterState, value: string) => {
    setActiveFilters(prev => {
      const current = prev[categoryKey] || [];
      const updatedList = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const newState = { ...prev, [categoryKey]: updatedList };
      
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        Object.entries(newState).forEach(([k, vals]) => {
           if (Array.isArray(vals)) vals.forEach(v => params.append(k, v));
        });
        window.history.replaceState(null, '', `?${params.toString()}`);
      }
      return newState;
    });
    setSearched(true);
  };

  const toggleCategoryAccordion = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const clearFilters = () => {
    setActiveFilters({ brand: [], category: [], thickness: [], wearLayer: [], type: [], colorTone: [], application: [], installType: [] });
    if (typeof window !== 'undefined') window.history.replaceState(null, '', window.location.pathname);
  };

  const getActiveFilterCount = () => Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);

  const processedList = (searched && results.length > 0 ? results : allProducts).filter(p => {
    const specsDump = JSON.stringify(p.specs || {}).toLowerCase() + " " + (p.description || "").toLowerCase() + " " + (p.name || "").toLowerCase() + " " + (p.category || "").toLowerCase();
    
    if (activeFilters.thickness.length > 0 && !activeFilters.thickness.some(th => specsDump.includes(th.toLowerCase()))) return false;
    if (activeFilters.wearLayer.length > 0 && !activeFilters.wearLayer.some(wl => specsDump.includes(wl.toLowerCase()))) return false;
    if (activeFilters.type.length > 0 && !activeFilters.type.some(t => {
        if (t === 'Sàn cuộn' || t === 'Thảm Cuộn') return specsDump.includes('roll') || specsDump.includes('cuộn');
        if (t === 'Sàn tấm' || t === 'Thảm Tấm') return specsDump.includes('tile') || specsDump.includes('tấm');
        if (t === 'Sàn thanh') return specsDump.includes('plank') || specsDump.includes('thanh');
        if (t === 'Sàn hèm khóa') return specsDump.includes('spc') || specsDump.includes('hèm');
        return specsDump.includes(t.toLowerCase());
    })) return false;
    if (activeFilters.application.length > 0 && !activeFilters.application.some(app => specsDump.includes(app.toLowerCase()))) return false;
    if (activeFilters.brand.length > 0 && !activeFilters.brand.some(br => specsDump.includes(br.toLowerCase()))) return false;
    if (activeFilters.category.length > 0 && !activeFilters.category.some(cat => specsDump.includes(cat.toLowerCase()))) return false;
    if (activeFilters.installType.length > 0 && !activeFilters.installType.some(it => specsDump.includes(it.toLowerCase()))) return false;
    
    return true;
  });

  if (!mounted) return null;

  const SidebarContent = () => (
    <div className="space-y-4">
      {hierarchyData.map(categoryBlock => {
        const isExpanded = expandedCategories.includes(categoryBlock.id);
        const isActiveCat = activeFilters.category.includes(categoryBlock.categoryMatch);
        
        return (
          <div key={categoryBlock.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => toggleCategoryAccordion(categoryBlock.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-wide text-sm">{categoryBlock.label}</span>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {isExpanded && (
              <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6">
                
                {/* Implicit Category Filter check */}
                <label className="flex items-center gap-3 p-3 rounded-xl border bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:border-blue-300 transition-colors">
                   <input type="checkbox" checked={isActiveCat} onChange={() => handleFilterToggle('category', categoryBlock.categoryMatch)} className="hidden" />
                   <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isActiveCat ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                     {isActiveCat && <Check className="w-3.5 h-3.5 text-white" />}
                   </div>
                   <span className="text-[14px] text-blue-700 dark:text-blue-400">✅ Duyệt toàn bộ "{categoryBlock.label}"</span>
                </label>

                {categoryBlock.filters.map(subFilter => (
                  <div key={subFilter.title} className="space-y-3">
                    <h4 className="text-[11px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest">{subFilter.title}</h4>
                    <div className="flex flex-col gap-1.5">
                      {subFilter.options.map(opt => {
                        const isChecked = activeFilters[subFilter.key].includes(opt);
                        return (
                          <label key={opt} className="flex items-start gap-3 py-1 cursor-pointer group">
                             <input type="checkbox" checked={isChecked} onChange={() => handleFilterToggle(subFilter.key, opt)} className="hidden" />
                             <div className={`mt-0.5 shrink-0 w-4 h-4 text-xs rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 dark:bg-slate-800'}`}>
                               {isChecked && <Check className="w-3 h-3" />}
                             </div>
                             <span className={`text-[13px] font-semibold transition-colors ${isChecked ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-300 dark:selection:bg-blue-900 transition-colors">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => { setSearched(false); setQuery(""); clearFilters(); }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">NHẬT HOA ICT</span>
            </div>
            
            <nav className="hidden md:flex space-x-8 items-center">
              <button onClick={() => { setSearched(false); setQuery(""); }} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
                Trang Chủ Thư Viện
              </button>
              <button className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500" /> Wishlist {wishlist.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
              </button>
              <a href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <Settings className="w-4 h-4" /> CMS Portal
              </a>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer">
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </button>
            </nav>

            <div className="flex md:hidden items-center gap-3">
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-4">
            <div className="px-5 py-4 space-y-2">
              <button onClick={() => { setIsMenuOpen(false); setSearched(false); }} className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Cửa hàng trung tâm</button>
              <button className="flex justify-between w-full px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                Yêu thích {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </button>
              <a href="/admin" className="block w-full px-4 py-3 rounded-xl text-base font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30">Quản trị CMS</a>
            </div>
          </div>
        )}
      </header>

      {/* FILTER DRAWER FOR MOBILE */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden animate-in fade-in">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
          <div className="relative w-[85%] max-w-sm h-full bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-left-full border-r border-slate-200 dark:border-slate-800">
            <div className="p-5 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Bộ Lọc 
                {getActiveFilterCount() > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{getActiveFilterCount()}</span>}
              </h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
            </div>
            
            <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              {getActiveFilterCount() > 0 && (
                <button onClick={clearFilters} className="w-full py-3.5 bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] transition-all border border-red-400 shrink-0">
                  Xóa Lọc Hiện Ở ({getActiveFilterCount()} Lựa Chọn)
                </button>
              )}
              <SidebarContent />
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
               <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-shadow">
                 Xem {processedList.length} Kết Quả
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {compareList.length > 0 && (
          <button onClick={executeAiComparison} className="lg:hidden absolute bottom-[130px] -right-2 w-max px-6 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center font-black animate-in slide-in-from-bottom-5">
            <Scale className="w-6 h-6 mr-2" /> So Sánh ({compareList.length}/3)
          </button>
        )}
        <button onClick={() => setIsFilterOpen(true)} className="lg:hidden w-14 h-14 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border border-slate-700 dark:border-slate-200 relative">
          <Filter className="w-6 h-6" />
          {getActiveFilterCount() > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-blue-600 rounded-full border-2 border-slate-800 dark:border-white items-center justify-center text-[10px] font-bold text-white">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
        <button className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/20 flex items-center justify-center transition-transform hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 flex flex-col relative z-10 transition-colors">
        {compareList.length > 0 && (
          <div className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/20 rounded-full pl-6 pr-3 py-3 items-center gap-6 animate-in slide-in-from-bottom-10">
            <div className="flex -space-x-3">
               {compareList.map((c, i) => {
                 const imgUrl = typeof c.images?.[0] === 'string' ? c.images[0] : c.images?.[0]?.url;
                 return (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden relative group cursor-pointer" onClick={(e) => toggleCompare(c, e)}>
                      <img src={imgUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-cover group-hover:blur-sm transition-all" />
                      <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></div>
                   </div>
                 );
               })}
               {compareList.length < 3 && (
                 <div className="w-10 h-10 rounded-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center z-[-1]">
                    <Plus className="w-4 h-4 text-indigo-400" />
                 </div>
               )}
            </div>
            <div>
               <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Đang chọn <span className="text-indigo-600 dark:text-indigo-400 font-black">{compareList.length}</span> sản phẩm</p>
               <p className="text-[11px] font-medium text-slate-700 dark:text-slate-400">Có thể đối chiếu hệ số P/P tự động</p>
            </div>
            <button onClick={executeAiComparison} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
               <Sparkles className="w-5 h-5 fill-white/20" /> Matrix Comparison
            </button>
          </div>
        )}

        {isCompareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95">
               <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-start shrink-0">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-3">
                      <Scale className="w-8 h-8 text-indigo-500" /> Bản báo cáo Khuyên Dùng
                    </h2>
                    <p className="text-slate-700 dark:text-slate-400 font-medium mt-2">Dựa trên cơ sở dữ liệu kỹ thuật và LLM Llama-3 (Groq Hardware)</p>
                  </div>
                  <button onClick={() => setIsCompareModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:scale-110 transition-transform"><X className="w-6 h-6 text-slate-500" /></button>
               </div>
               <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                  {isComparing ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
                        <Sparkles className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Đang phân tích thông số bằng AI...</h3>
                      <p className="text-slate-700 dark:text-slate-400 mt-2 font-medium">(Vui lòng đợi khoảng 5-10 giây)</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      {compareResult.toLowerCase().includes("lỗi") ? (
                        <div className="mt-4 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl flex flex-col items-center text-center">
                           <p className="font-black text-red-600 dark:text-red-400 text-xl mb-3">Lỗi kết nối AI</p>
                           <p className="font-medium text-red-500 dark:text-red-300">{compareResult}</p>
                           <div className="mt-6">
                              <button onClick={executeAiComparison} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-10 rounded-full shadow-xl shadow-red-500/20 transition-transform hover:scale-105 active:scale-95">
                                 Thử Lại (Retry API)
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none prose-h1:text-2xl prose-h1:font-black prose-h3:text-indigo-600 dark:prose-h3:text-indigo-400 prose-li:font-medium">
                          <ReactMarkdown>{compareResult}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        <section className="bg-white dark:bg-slate-900 px-4 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-400/10 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Khám phá hệ vật liệu <br className="md:hidden" />
              <span className="text-blue-600 dark:text-blue-500 inline-flex items-center gap-2">Siêu tốc bằng AI <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" /></span>
            </h1>

            <form onSubmit={(e) => handleSearch(e)} className="mt-8 max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VD: Tìm sàn cuộn bệnh viện... hoặc nhập POST [Nội dung spec] để thêm kho"
                className="block w-full pl-14 pr-24 sm:pr-36 py-4 sm:py-5 border-2 border-slate-200 dark:border-slate-800 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 font-bold text-base sm:text-lg transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
              />
              <div className="absolute inset-y-0 right-2 sm:right-2.5 flex items-center">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 font-black shadow-md flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tư vấn <span className="hidden sm:inline">ngay</span></>}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="flex-1 bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-[1440px] mx-auto flex gap-8">
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" /> Bảng Phân Cấp</h2>
                 {getActiveFilterCount() > 0 && (
                   <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full transition-colors">Xóa ({getActiveFilterCount()})</button>
                 )}
              </div>
              <SidebarContent />
            </aside>

            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-700 dark:text-slate-400">
                  <div className="relative">
                     <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
                     <Search className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="font-extrabold text-xl text-slate-800 dark:text-slate-200 mt-6">Groq AI đang truy quét CSDL...</p>
                  <p className="text-slate-700 font-medium mt-2">Truy xuất tốc độ 800 tokens/s dành riêng cho bạn</p>
                </div>
              ) : processedList.length > 0 ? (
                <>
                  {aiResponse && (
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-[2rem] p-6 sm:p-8 border border-blue-100 dark:border-blue-900/50 shadow-sm animate-in zoom-in-95">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Trợ Lý Dữ Liệu Nhật Hoa</h2>
                           <p className="text-[11px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest mt-0.5">Giá trị cốt lõi • Phân tích Realtime</p>
                        </div>
                      </div>
                      <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none prose-p:font-medium prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-md prose-img:max-h-64 prose-img:object-cover prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-headings:text-slate-800 dark:prose-headings:text-slate-200">
                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      Lưới Sản Phẩm
                      {searched && <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-full border border-amber-200 dark:border-amber-800/50">Truy vấn AI</span>}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                        Phân vùng: <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">{processedList.length} Items</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-32">
                    {processedList.map((product, idx) => {
                      const isLiked = wishlist.includes(product.id);
                      const isComparing = compareList.find(p => p.id === product.id);
                      // Type safety guard for images that might be objects
                      const primaryImageUrl = typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url;

                      return (
                        <div key={idx} className={`bg-white dark:bg-slate-900 rounded-[2rem] border-2 shadow-sm transition-all group overflow-hidden flex flex-col relative ${isComparing ? 'border-indigo-500 dark:border-indigo-500 shadow-indigo-500/20 shadow-xl scale-[1.02]' : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl'}`}>
                          
                          <div className="absolute z-10 top-4 right-4 flex flex-col gap-2 items-end">
                            <button onClick={(e) => toggleWishlist(product.id, e)} className="p-3 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg hover:scale-110 transition-transform mb-2">
                              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                            </button>
                          </div>

                          <div onClick={() => { setSelectedProduct(product); setActiveThumb(0); }} className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer">
                            <img
                              src={primaryImageUrl || product.image || 'https://via.placeholder.com/800x600?text=No+Image'}
                              alt={product.name}
                              className={`w-full h-full object-cover transition-transform duration-700 ${isComparing ? 'scale-105 opacity-90' : 'group-hover:scale-110'}`}
                            />
                            {/* Render Color Tags if images carry captions */}
                            {product.images && product.images.length > 0 && typeof product.images[0] === 'object' && product.images[0].caption && (
                               <div className="absolute top-4 left-4">
                                  <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/20">
                                     {product.images[0].caption}
                                  </span>
                               </div>
                            )}

                            <div className="absolute bottom-4 left-4 flex gap-2 w-[calc(100%-2rem)] flex-wrap">
                               <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide bg-blue-600/90 backdrop-blur-md text-white rounded-lg shadow-sm border border-blue-500/50">
                                 {product.category || 'Vật tư'}
                               </span>
                               {product.pp_score && (
                                 <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide bg-emerald-500/90 backdrop-blur-md text-white rounded-lg shadow-sm border border-emerald-400/50 flex items-center gap-1">
                                   P/P: {product.pp_score}
                                 </span>
                               )}
                            </div>
                          </div>

                          <div onClick={() => { setSelectedProduct(product); setActiveThumb(0); }} className="p-6 flex flex-col flex-1 cursor-pointer">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2">
                              {product.name}
                            </h3>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                               {product.specs?.['Độ dày'] && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700">Dày {product.specs['Độ dày']}</span>}
                               {product.specs?.['Lớp bảo vệ'] && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700">Wear {product.specs['Lớp bảo vệ']}</span>}
                            </div>

                            <p className="text-sm text-slate-800 dark:text-slate-400 mb-6 line-clamp-2 font-medium">
                              {product.description || product.materials}
                            </p>

                            <div className="mt-auto border-t-2 border-slate-100 dark:border-slate-800/50 pt-5 flex justify-between items-end">
                              <div>
                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Báo giá cơ bản</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price || product.price)}
                                </p>
                              </div>
                            </div>
                            
                            <label className="flex items-center gap-2 mt-4 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 group/cb" onClick={(e) => toggleCompare(product, e)}>
                               <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${isComparing ? 'bg-indigo-600 border-indigo-600 shrink-0' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 shrink-0 group-hover/cb:border-indigo-400'}`}>
                                 {isComparing && <Check className="w-3.5 h-3.5 text-white" />}
                               </div>
                               <span className={`text-sm font-bold ${isComparing ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Chọn So sánh thông số</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-200">Không tìm thấy mã sàn phù hợp</p>
                  <p className="text-slate-700 dark:text-slate-400 mt-3 font-medium max-w-sm mx-auto">Thử hạ bớt tiêu chí trong Bảng Phân Cấp hoặc thay đổi truy vấn AI của bạn.</p>
                  <button onClick={clearFilters} className="mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">Xóa Bộ Lọc</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* === PRODUCT QUICK-VIEW MODAL === */}
      {selectedProduct && (() => {
        const p = selectedProduct;
        const imgs = (p.images || []).map((im: any) => typeof im === 'string' ? { url: im, caption: '' } : im);
        const activeImg = imgs[activeThumb] || { url: p.image || 'https://via.placeholder.com/800x600?text=No+Image', caption: '' };
        const specs = p.specs || {};
        const featureList = (specs['Công năng'] || '').split(',').map((f: string) => f.trim()).filter(Boolean);
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[92vh] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

              {/* Close Button */}
              <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 z-50 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700">
                <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>

              <div className="overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">

                  {/* LEFT: Media Gallery (2/5) */}
                  <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <img src={activeImg.url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    {activeImg.caption && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Mã màu: <span className="text-blue-600 dark:text-blue-400">{activeImg.caption}</span></span>
                      </div>
                    )}
                    {imgs.length > 1 && (
                      <div className="grid grid-cols-5 gap-2 mt-4">
                        {imgs.map((im: any, i: number) => (
                          <button key={i} onClick={() => setActiveThumb(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === activeThumb ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}>
                            <img src={im.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Product Info (3/5) */}
                  <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {p.brand && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg uppercase tracking-wide">{p.brand}</span>}
                        {p.category && <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">{p.category}</span>}
                        {specs?.['Hạng mục con'] && <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg">{specs['Hạng mục con']}</span>}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">{p.name}</h2>
                    </div>

                    {/* Price & P/P */}
                    <div className="flex items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Báo giá cơ bản</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.base_price || p.price || 0)}</p>
                      </div>
                      {p.pp_score && (
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">P/P Score</p>
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{p.pp_score}/10</p>
                        </div>
                      )}
                    </div>

                    {/* Specs Grid */}
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Thông số kỹ thuật</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[{l: 'Độ dày', v: specs['Độ dày']}, {l: 'Lớp bảo vệ', v: specs['Lớp bảo vệ']}, {l: 'Cấu trúc', v: specs['Cấu trúc']}, {l: 'Kiểu lắp đặt', v: specs['Kiểu lắp đặt'] || p.installation_details?.['Kiểu lắp đặt']}].filter(s => s.v).map(s => (
                          <div key={s.l} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{s.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features Chips */}
                    {featureList.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Công năng nổi bật</h3>
                        <div className="flex flex-wrap gap-2">
                          {featureList.map((f: string) => (
                            <span key={f} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-full border border-blue-200 dark:border-blue-800/50">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {(p.materials || p.description) && (
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Mô tả chi tiết</h3>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{p.materials || p.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
