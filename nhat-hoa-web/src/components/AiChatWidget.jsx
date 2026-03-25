'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của Nhật Hoa. Bạn cần tư vấn loại sàn nào? (VD: Tìm sàn phòng sạch rẻ nhất)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { filteredProducts } = useStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, activeContext: filteredProducts })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi kết nối AI. Vui lòng kiểm tra API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-3 animate-bounce shadow-blue-900/50 hover:bg-black"
      >
        <Sparkles className="w-6 h-6 text-blue-400" />
        <span className="font-bold hidden md:block">AI Consultant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold tracking-wide">Nhật Hoa AI</h3>
            <p className="text-xs text-blue-300">Context-Aware Smart Assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge */}
      <div className="bg-blue-50 py-2 text-center border-b border-blue-100 flex justify-center items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-xs font-bold text-blue-800">
          Reading {filteredProducts.length} active filtered results in realtime
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about price/performance, specs..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 placeholder-slate-500 text-slate-900 text-sm font-medium rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
