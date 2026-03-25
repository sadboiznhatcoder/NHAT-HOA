import { useState } from 'react';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../data/supabase';
import { Link } from 'react-router-dom';

export default function AIFilter() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [reasoning, setReasoning] = useState('');

  const handleProcessAI = async () => {
    if (!prompt) return;
    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    const allProducts = await fetchProducts();
    // Simulated NLP classification based on keywords
    const isMedical = prompt.toLowerCase().includes('y tế') || prompt.toLowerCase().includes('bệnh viện') || prompt.toLowerCase().includes('sạch');
    const isIndustrial = prompt.toLowerCase().includes('nhà máy') || prompt.toLowerCase().includes('công nghiệp') || prompt.toLowerCase().includes('xưởng');
    const isOffice = prompt.toLowerCase().includes('văn phòng') || prompt.toLowerCase().includes('công ty');
    
    let filtered = [];
    let reasonText = '';

    if (isMedical) {
      filtered = allProducts.filter(p => p.categories.name.toLowerCase().includes('medical') || p.categories.name.toLowerCase().includes('cleanroom'));
      reasonText = "Dựa trên yêu cầu của bạn về môi trường y tế/phòng sạch, hệ thống AI đề xuất các loại sàn Vinyl chống tĩnh điện và kháng khuẩn. Những sản phẩm này giúp đảm bảo tiêu chuẩn vô trùng và an toàn tĩnh điện khắt khe nhất.";
    } else if (isIndustrial) {
      filtered = allProducts.filter(p => p.categories.name.toLowerCase().includes('industrial'));
      reasonText = "Đối với môi trường công nghiệp/nhà xưởng chịu tải trọng lớn, AI đề xuất các loại sàn Epoxy chuyên dụng với khả năng chịu lực nén đỉnh cao, chống mài mòn và kháng hóa chất cực tốt.";
    } else if (isOffice) {
      filtered = allProducts.filter(p => p.categories.name.toLowerCase().includes('office') || p.categories.name.toLowerCase().includes('corporate'));
      reasonText = "Đối với môi trường văn phòng thương mại, AI đề xuất thảm viên hoặc sàn Vinyl vân gỗ để tăng thẩm mỹ, tiêu âm hiệu quả, và mang lại sự thoải mái khi di chuyển với mật độ cao.";
    } else {
      filtered = allProducts;
      reasonText = "Tôi đã tìm được các dòng sản phẩm đa dụng có cấu hình tốt nhất phù hợp với mô tả của bạn. Dưới đây là các loại mặt sàn bán chạy và có độ bền cao.";
    }

    setResults(filtered.slice(0, 3));
    setReasoning(reasonText);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
          AI Assistant & Smart Filter
        </h2>
        <p className="text-slate-500 mt-2 text-lg">Describe your project requirements in natural language and let AI find the perfect flooring solution.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center p-3 relative focus-within:ring-2 focus-within:ring-purple-500 transition-shadow">
        <Sparkles className="w-6 h-6 text-purple-400 ml-2 absolute" />
        <input 
          type="text" 
          placeholder='e.g., "Mặt sàn nào chống tĩnh điện tốt nhất cho phòng sạch y tế?"'
          className="w-full pl-12 pr-32 py-3 bg-transparent border-none outline-none text-slate-800 text-lg placeholder:text-slate-300"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleProcessAI()}
        />
        <button 
          onClick={handleProcessAI} disabled={loading || !prompt}
          className="absolute right-3 top-3 bottom-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 rounded-xl font-semibold transition-colors flex items-center gap-2"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </div>

      {reasoning && (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Bot className="w-48 h-48 text-purple-900" />
          </div>
          <h3 className="text-purple-900 font-bold mb-3 flex items-center gap-2 text-lg relative z-10">
            <Sparkles className="w-5 h-5 text-purple-600" /> AI Analysis
          </h3>
          <p className="text-purple-800 leading-relaxed text-lg relative z-10">{reasoning}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h3 className="text-xl font-bold text-slate-900 border-b pb-2">Recommended Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(product => (
              <Link to={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                   <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 border border-purple-200">
                     <Sparkles className="w-3 h-3" /> Top Match
                   </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-blue-600 mb-1 tracking-wider uppercase">{product.brands.name}</div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{product.name}</h3>
                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
                    <span className="text-primary font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_per_m2)} / m²
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
