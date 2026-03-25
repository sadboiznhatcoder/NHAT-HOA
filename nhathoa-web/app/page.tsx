"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X, Sparkles, Loader2, Info, Heart, Phone, MessageCircle, Clock } from "lucide-react";

import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Business Features State
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load from localStorage on mount (Client-Side Only)
  useEffect(() => {
    const savedDocs = localStorage.getItem("nhat_hoa_search_history");
    if (savedDocs) setSearchHistory(JSON.parse(savedDocs));

    const savedWishlist = localStorage.getItem("nhat_hoa_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const loadRealData = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) {
           setAllProducts(data);
           // Prevent auto-showing products until AI searches, or optionally implement static library view later
        }
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

    // Save Search History
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-200">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">NHẬT HOA ICT</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Thư viện sàn</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-bold transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> Yêu thích {wishlist.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Báo giá AI</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-bold transition-colors">Liên hệ</a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              <a href="#" className="relative text-slate-600">
                <Heart className="w-6 h-6" />
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlist.length}</span>}
              </a>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 -mr-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-2xl animate-in slide-in-from-top-4">
            <div className="px-5 py-4 space-y-2">
              <a href="#" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">Thư viện sàn</a>
              <a href="#" className="flex justify-between px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                Yêu thích {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </a>
              <a href="#" className="block px-4 py-3 rounded-xl text-base font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-50 transition-colors border border-blue-100">Báo giá Trực tuyến</a>
              <a href="#" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">Liên lạc Hỗ trợ</a>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col pt-4 sm:pt-0 pb-20">
        
        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button className="w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-110 animate-bounce">
            <Phone className="w-6 h-6" />
          </button>
        </div>

        {/* Hero & Search Section */}
        <section className="bg-white px-4 pt-12 pb-16 sm:pt-20 sm:pb-20 border-b border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Khám phá giải pháp sàn <br className="md:hidden" />
              <span className="text-blue-600 inline-flex items-center gap-2 lg:gap-3">bằng AI thông minh <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-blue-500 animate-pulse" /></span>
            </h1>
            <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Nhập yêu cầu bằng ngôn ngữ tự nhiên, hệ thống sẽ đề xuất độ dày, chủng loại và mức giá tối ưu nhất cho công trình của bạn.
            </p>

            <form onSubmit={(e) => handleSearch(e)} className="mt-10 max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VD: Tìm thảm văn phòng tiêu âm tốt nhất..."
                className="block w-full pl-14 pr-24 sm:pr-36 py-4 sm:py-5 border-2 border-slate-200 rounded-full leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-base sm:text-lg transition-all shadow-lg shadow-slate-200/50"
              />
              <div className="absolute inset-y-0 right-2 sm:right-2.5 flex items-center">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 sm:px-6 sm:py-3.5 border border-transparent text-sm sm:text-base font-black rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <>Tư vấn <span className="hidden sm:inline">ngay</span></>
                  )}
                </button>
              </div>
            </form>

            {/* Search History Chips */}
            {searchHistory.length > 0 && !loading && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Lịch sử:
                </span>
                {searchHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(undefined, item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs sm:text-sm font-semibold rounded-full transition-colors border border-slate-200 hover:border-blue-200"
                  >
                    "{item}"
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="flex-1 bg-slate-50 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 animate-in fade-in duration-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  </div>
                </div>
                <p className="font-extrabold text-xl text-slate-800 tracking-tight">AI đang quét dữ liệu...</p>
                <p className="text-sm font-medium mt-2">Tính toán khoảng giá, độ mài mòn, và mục đích sử dụng.</p>
              </div>
            ) : searched ? (
              <div className="animate-in slide-in-from-bottom-5 duration-500">
                <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Kết quả Đề xuất
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 font-bold mt-1">
                      Hệ thống chọn lọc được <span className="text-blue-600">{results.length}</span> giải pháp phù hợp nhất.
                    </p>
                  </div>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {results.map((product, idx) => {
                      const isLiked = wishlist.includes(product.id);
                      return (
                        <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden flex flex-col relative">
                          
                          {/* Wishlist Button Overlay */}
                          <button 
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="absolute z-10 top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                          </button>

                          {/* Image Container */}
                          <div className="aspect-[4/3] sm:aspect-square relative bg-slate-100 overflow-hidden">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/400'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                              <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide bg-slate-900/80 backdrop-blur-md text-white rounded-lg shadow-sm">
                                {product.category}
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug mb-3 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-600 line-clamp-3 mb-6 font-medium leading-relaxed">
                              Thương hiệu: {product.brand} | Điểm P/P: {product.pp_score}/10
                              <br/>{product.materials}
                            </p>
                            <div className="mt-auto border-t border-slate-100 pt-5 flex items-end justify-between">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá vật tư / m²</p>
                                <p className="text-[22px] font-black text-blue-600 leading-none">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
                                </p>
                              </div>
                              <button className="p-3.5 rounded-[14px] bg-slate-50 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors shadow-sm border border-slate-200 hover:border-transparent font-bold text-sm hidden sm:block">
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                    <div className="inline-flex w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-700">Rất tiếc! Không có sản phẩm nào.</p>
                    <p className="text-slate-500 mt-2 font-medium">Bạn có thể thử mô tả chi tiết hơn hoặc chọn từ khóa khác.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 animate-in fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 mb-6 shadow-inner border-[6px] border-white">
                  <Sparkles className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Hệ Thống Trợ Lý Ảo Sẵn Sàng</h3>
                <p className="text-slate-500 font-medium mt-4 max-w-lg mx-auto text-lg leading-relaxed">
                  Nhật Hoa ICT mang tới tốc độ tư vấn siêu tốc. Nền tảng được tối ưu hóa cho di động giúp bạn chốt phương án mọi lúc, mọi nơi.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
