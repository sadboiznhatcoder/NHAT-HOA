"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X, Sparkles, Loader2, Info, Heart, Phone, MessageCircle, Clock, Sun, Moon, Filter, ShieldCheck, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile Filter Drawer
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedDocs = localStorage.getItem("nhat_hoa_search_history");
    if (savedDocs) setSearchHistory(JSON.parse(savedDocs));

    const savedWishlist = localStorage.getItem("nhat_hoa_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const loadRealData = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) setAllProducts(data);
    };
    loadRealData();
  }, []);

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = directQuery || query;
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setLoading(true);
    setSearched(true);

    if (!directQuery) {
        const newHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 4);
        setSearchHistory(newHistory);
        localStorage.setItem("nhat_hoa_search_history", JSON.stringify(newHistory));
    }

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, activeContext: allProducts }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-300 dark:selection:bg-blue-900 transition-colors">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">NHẬT HOA ICT</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">Thư viện sàn</a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> Yêu thích {wishlist.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
              </a>
              <a href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <Settings className="w-4 h-4" /> Quản lý
              </a>
              
              <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </nav>

            {/* Mobile Menu Buttons */}
            <div className="flex md:hidden items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-4">
            <div className="px-5 py-4 space-y-2">
              <a href="#" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Thư viện sàn</a>
              <a href="#" className="flex justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                Yêu thích {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </a>
              <a href="/admin" className="block px-4 py-3 rounded-xl text-base font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30">Quản lý / Đăng bài</a>
            </div>
          </div>
        )}
      </header>

      {/* FILTER DRAWER FOR MOBILE */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden animate-in fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-left-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Filter className="w-5 h-5" /> Bộ Lọc</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
            </div>
            
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ứng Dụng</h3>
                <div className="space-y-2">
                  {['Phòng sạch', 'Bệnh viện', 'Trường học', 'Nhà máy'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Độ Dày</h3>
                <div className="space-y-2">
                  {['2.0mm', '3.0mm', '5.0mm', '6.5mm'].map(th => (
                    <label key={th} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                      {th}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setIsFilterOpen(false)} className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg">
              Áp Dụng Lọc
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Mobile Filter Button */}
        <button onClick={() => setIsFilterOpen(true)} className="md:hidden w-14 h-14 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110">
          <Filter className="w-6 h-6" />
        </button>
        <button className="w-14 h-14 bg-sky-500 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-110 animate-bounce">
          <Phone className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 flex flex-col">
        {/* Responsive Centered Search Bar Section */}
        <section className="bg-white dark:bg-slate-900 px-4 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-400/10 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Khám phá giải pháp sàn <br className="md:hidden" />
              <span className="text-blue-600 dark:text-blue-500 inline-flex items-center gap-2">bằng AI <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" /></span>
            </h1>

            <form onSubmit={(e) => handleSearch(e)} className="mt-8 max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VD: Tìm kiếm sàn gỗ, sàn nhựa, phòng sạch..."
                className="block w-full pl-14 pr-24 sm:pr-36 py-4 sm:py-5 border-2 border-slate-200 dark:border-slate-800 rounded-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 font-medium text-base sm:text-lg transition-all shadow-lg shadow-slate-200/50 dark:shadow-none"
              />
              <div className="absolute inset-y-0 right-2 sm:right-2.5 flex items-center">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 font-black shadow-md flex items-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tư vấn <span className="hidden sm:inline">ngay</span></>}
                </button>
              </div>
            </form>

            {searchHistory.length > 0 && !loading && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Gợi ý:
                </span>
                {searchHistory.map((item, i) => (
                  <button key={i} onClick={() => handleSearch(undefined, item)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-full transition-colors border border-slate-200 dark:border-slate-700">
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar & Grid Layout */}
        <section className="flex-1 bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-[1400px] mx-auto flex gap-8">
            
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden md:block w-72 shrink-0 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" /> Bộ Lọc Cố Định</h2>
                
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ứng Dụng</h3>
                <div className="space-y-3 mb-8">
                  {['Sàn thao tác', 'Phòng kỹ thuật', 'Khu chế xuất', 'Giáo dục'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-800" />
                      {cat}
                    </label>
                  ))}
                </div>

                <button className="w-full py-3.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                  Áp Dụng Tiêu Chí
                </button>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="font-extrabold text-xl text-slate-800 dark:text-slate-200">Hệ thống đang trích xuất kho...</p>
                </div>
              ) : (searched && results.length > 0) || allProducts.length > 0 ? (
                <>
                  <div className="mb-6 flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Danh Mục Sản Phẩm</h2>
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-sm font-bold px-4 py-1.5 rounded-full">
                      {(searched ? results : allProducts).length} Kết quả
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(searched ? results : allProducts).map((product, idx) => {
                      const isLiked = wishlist.includes(product.id);
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:hover:shadow-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all group overflow-hidden flex flex-col relative">
                          <button onClick={(e) => toggleWishlist(product.id, e)} className="absolute z-10 top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform hidden sm:block">
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                          </button>

                          <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img
                              src={product.images?.[0] || product.image || 'https://via.placeholder.com/400'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-4 left-4 flex gap-2">
                              <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white rounded-lg shadow-sm">
                                {product.category || 'Vật tư'}
                              </span>
                            </div>
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 font-medium">
                              {product.description || product.materials}
                            </p>
                            <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-between items-end">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đơn giá / m²</p>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price || product.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 border-dashed">
                  <ShieldCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">Hệ thống đang chạy trống</p>
                  <p className="text-slate-500 mt-2 font-medium">Vui lòng truy cập trang Quản lý để bắt đầu đăng sản phẩm thực.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
