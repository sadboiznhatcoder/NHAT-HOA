"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, LayoutDashboard, Settings, X, UploadCloud, Edit, Search, Filter, Loader2, Link } from "lucide-react";
import { useTheme } from "next-themes";
import { CATEGORY_HIERARCHY } from "../../lib/constants";

const PRODUCT_CATEGORIES = ["Sàn Y Tế", "Sàn Thể Thao", "Sàn Văn Phòng", "Sàn Công Nghiệp", "Sàn Giao Thông", "Khác"];
const THICKNESS_OPTS = ["2.0mm", "3.0mm", "4.5mm", "5.0mm", "8.0mm", "Khác"];
const WEAR_LAYER_OPTS = ["0.1mm", "0.3mm", "0.5mm", "0.7mm", "1.0mm", "Khác"];
const CONFIG_OPTS = ["Sàn cuộn", "Sàn tấm", "Sàn thanh", "Sàn hèm khóa", "Sàn nâng"];
const FEATURES_OPTS = ["Kháng khuẩn", "Chống tĩnh điện", "Chịu lực cao", "Chống trơn trượt", "Cách âm", "Chống cháy"];
const INSTALL_OPTS = ["Dán keo", "Hèm khóa", "Tự dính", "Đặt rời (Loose lay)"];

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Sàn Y Tế",
    base_price: "",
    materials: "",
    pp_score: 5,
    colors: [] as string[],
    images: [] as any[],
    installation_details: {} as Record<string, string>,
    specs: {} as Record<string, string>,
  });

  const [productsList, setProductsList] = useState<any[]>([]);
  const [listSearch, setListSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [listCategory, setListCategory] = useState("Tất cả");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [colorInput, setColorInput] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) {
      setProductsList(data);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const prodToEdit = data.find(p => p.id === editId);
          if (prodToEdit) handleEdit(prodToEdit);
          window.history.replaceState({}, '', '/admin');
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    setUploadProgress({ current: 0, total: newFiles.length });
    setStatus("loading");
    setIsUploading(true);

    try {
      let uploadedUrls: any[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage.from('product-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
        
        if (!error && data) {
          const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(filePath);
          uploadedUrls.push({ url: publicData.publicUrl, caption: "" });
        }
        setUploadProgress({ current: i + 1, total: newFiles.length });
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setStatus("idle");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Lỗi upload ảnh trực tiếp.");
      setStatus("error");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const img = newImages[index];
      if (typeof img === 'string') {
         newImages[index] = { url: img, caption };
      } else {
         newImages[index] = { ...img, caption };
      }
      return { ...prev, images: newImages };
    });
  };

  const handleEdit = (prod: any) => {
    setSelectedProductId(prod.id);
    setFormData({
      name: prod.name || "",
      brand: prod.brand || "",
      category: prod.category || "Sàn Y Tế",
      base_price: prod.base_price ? prod.base_price.toString() : "",
      materials: prod.materials || "",
      pp_score: prod.pp_score || 5,
      colors: prod.colors || [],
      images: (prod.images || []).map((img: any) => typeof img === 'string' ? { url: img, caption: "" } : img),
      installation_details: prod.installation_details || {},
      specs: prod.specs || {}
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setFormData({
      name: "", brand: "", category: "Sàn Y Tế", base_price: "",
      materials: "", pp_score: 5, colors: [], images: [],
      installation_details: {}, specs: {}
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  const toggleFeature = (feat: string) => {
    const current = formData.specs['Công năng'] ? formData.specs['Công năng'].split(', ') : [];
    if (current.includes(feat)) {
       setFormData(prev => ({ ...prev, specs: { ...prev.specs, 'Công năng': current.filter(c => c !== feat).join(', ') } }));
    } else {
       setFormData(prev => ({ ...prev, specs: { ...prev.specs, 'Công năng': [...current, feat].join(', ') } }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const submissionData = {
        ...formData,
        base_price: Number(formData.base_price) || 0,
      };

      let dbError;
      if (selectedProductId) {
        const { error } = await supabase.from("products").update(submissionData).eq("id", selectedProductId);
        dbError = error;
      } else {
        const { error } = await supabase.from("products").insert([submissionData]);
        dbError = error;
      }

      if (dbError) throw dbError;

      setStatus("success");
      handleReset();
      fetchProducts();
      setTimeout(() => setStatus("idle"), 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Lỗi thao tác cơ sở dữ liệu");
      setStatus("error");
    }
  };

  const progressPercentage = uploadProgress.total > 0 
    ? Math.round((uploadProgress.current / uploadProgress.total) * 100) 
    : 0;

  const filteredList = productsList.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(listSearch.toLowerCase()) || (p.brand || "").toLowerCase().includes(listSearch.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trung Tâm Quản Lý</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Bảng thông số kỹ thuật nội bộ Nhật Hoa</p>
            </div>
          </div>
          <a href="/" className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Quay lại trang chủ
          </a>
        </div>

        {status === "success" && (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-6 h-6" /> {selectedProductId ? "Cập nhật sản phẩm thành công!" : "Khởi tạo sản phẩm mới thành công!"}
          </div>
        )}
        {status === "error" && (
          <div className="p-5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 font-bold shadow-sm animate-in fade-in">
            <AlertCircle className="w-6 h-6" /> Lỗi: {errorMsg}
          </div>
        )}

        {/* ADMIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-8 relative">
          {status === "loading" && uploadProgress.total > 0 && (
            <div className="absolute inset-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center">
               <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
               <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Đang Upload trực tiếp...</p>
               <p className="text-blue-600 dark:text-blue-400 font-bold mb-4">Đã tải lên {uploadProgress.current}/{uploadProgress.total} Media Object</p>
               <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                 <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600" /> Thông tin Cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên sản phẩm *</label>
                <input required list="name-suggestions" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium" placeholder="VD: Sàn kháng khuẩn IQ Optima" />
                <datalist id="name-suggestions">
                   {Array.from(new Set(productsList.map(p => p.name))).map((n: any) => <option key={n} value={n} />)}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thương hiệu (Brand) *</label>
                <input required list="brand-suggestions" type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium" placeholder="VD: Tarkett, Gerflor..." />
                <datalist id="brand-suggestions">
                   {(CATEGORY_HIERARCHY[formData.category as keyof typeof CATEGORY_HIERARCHY]?.brands || ["Tarkett", "LG Hausys", "Suminoe", "NAKA CORP", "Viacor", "Beaver Panel"]).map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mức phân loại</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, specs: {...formData.specs, 'Hạng mục con': ''}})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  {Object.keys(CATEGORY_HIERARCHY).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hạng mục con (Sub-category)</label>
                <select value={formData.specs?.['Hạng mục con'] || ""} onChange={e => setFormData({...formData, specs: {...formData.specs, 'Hạng mục con': e.target.value}})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  <option value="">-- Chọn (Tùy chọn) --</option>
                  {(CATEGORY_HIERARCHY[formData.category as keyof typeof CATEGORY_HIERARCHY]?.subCategories || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đơn giá / m² (VNĐ)</label>
                  <input type="number" min="0" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Điểm P/P (1-10)</label>
                  <input type="number" min="1" max="10" value={formData.pp_score} onChange={e => setFormData({...formData, pp_score: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả Vật liệu & Ưu điểm</label>
                <textarea rows={3} value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 font-medium" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-600" /> Cấu hình Thuộc tính Lọc Cứng (Specs)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Thickness */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Độ dày (Thickness)</label>
                <select value={formData.specs['Độ dày'] || ""} onChange={e => setFormData(prev => ({...prev, specs: {...prev.specs, 'Độ dày': e.target.value}}))} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  <option value="">Chọn độ dày...</option>
                  {THICKNESS_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Wear Layer */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lớp bảo vệ (Wear Layer)</label>
                <select value={formData.specs['Lớp bảo vệ'] || ""} onChange={e => setFormData(prev => ({...prev, specs: {...prev.specs, 'Lớp bảo vệ': e.target.value}}))} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  <option value="">Chọn ...</option>
                  {WEAR_LAYER_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Construction */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cấu trúc Sàn</label>
                <select value={formData.specs['Cấu trúc'] || ""} onChange={e => setFormData(prev => ({...prev, specs: {...prev.specs, 'Cấu trúc': e.target.value}}))} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  <option value="">Chọn ...</option>
                  {CONFIG_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Install Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kiểu lắp đặt</label>
                <select value={formData.installation_details['Kiểu lắp đặt'] || ""} onChange={e => setFormData(prev => ({...prev, installation_details: {...prev.installation_details, 'Kiểu lắp đặt': e.target.value}}))} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 font-medium">
                  <option value="">Chọn ...</option>
                  {INSTALL_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Công Năng Nổi Bật (Tính năng đặc biệt)</label>
              <div className="flex flex-wrap gap-4">
                 {FEATURES_OPTS.map(feat => {
                    const currentFeats = formData.specs['Công năng'] ? formData.specs['Công năng'].split(', ') : [];
                    const isChecked = currentFeats.includes(feat);
                    return (
                      <label key={feat} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                         <input type="checkbox" checked={isChecked} onChange={() => toggleFeature(feat)} className="hidden" />
                         <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400 dark:border-slate-600'}`}>
                           {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                         </div>
                         {feat}
                      </label>
                    )
                 })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2"><UploadCloud className="w-5 h-5 text-blue-600" /> Hình ảnh & Media (Immediate Upload)</h2>
            <p className="text-sm font-medium text-slate-500">Tối đa 50 hình ảnh. Các tệp sẽ được tải ngay lên Bucket `product-images` khi bạn chọn hình.</p>
            
            <div className={`border-3 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-10 mt-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploading} />
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">{isUploading ? "Đang tải ảnh lên máy chủ..." : "Bấm để chọn nhiều ảnh hoặc Kéo thả vào đây"}</p>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {formData.images.map((imgItem, idx) => {
                  const url = typeof imgItem === 'string' ? imgItem : imgItem.url;
                  const caption = typeof imgItem === 'string' ? '' : imgItem.caption || '';
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                       <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 group shrink-0">
                         <img src={url} alt="" className="w-full h-full object-cover" />
                         <button onClick={() => removeUploadedImage(idx)} type="button" className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                           <Trash2 className="w-4 h-4" />
                         </button>
                         <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 text-white text-[10px] font-bold text-center py-1 flex items-center justify-center gap-1">
                           <Link className="w-3 h-3" /> Đã Upload
                         </div>
                       </div>
                       <input 
                         type="text" 
                         className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 placeholder-slate-400" 
                         placeholder="Mã màu / Chú thích" 
                         value={caption}
                         onChange={(e) => updateImageCaption(idx, e.target.value)}
                       />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-6 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-black text-slate-800 dark:text-slate-200 hidden sm:inline">Hệ thống sẵn sàng {selectedProductId ? "Cập nhật" : "Ghi mới"}</span>
            </div>
            <div className="flex gap-4">
               {selectedProductId && <button type="button" onClick={handleReset} className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Hủy Edit</button>}
               <button type="submit" disabled={status === 'loading'} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-all">
                 <Save className="w-5 h-5" /> {selectedProductId ? "LƯU TRỮ CHỈNH SỬA" : "ĐĂNG BÀI MỚI"}
               </button>
            </div>
          </div>
        </form>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-12">
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-blue-600" /> Quản lý danh mục Thực tế</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full sm:w-48 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 font-medium">
                <option value="ALL">Tất cả danh mục</option>
                <option value="Sàn VINYL">Sàn VINYL</option>
                <option value="Sàn Y Tế">Sàn Y Tế</option>
                <option value="Sàn Thể Thao">Sàn Thể Thao</option>
                <option value="Sàn Thạch Anh">Sàn Thạch Anh</option>
                <option value="Sàn Epoxy">Sàn Epoxy</option>
                <option value="Thảm">Thảm</option>
                <option value="Sàn Nâng">Sàn Nâng</option>
                <option value="Sàn Tự Phẳng">Sàn Tự Phẳng</option>
                <option value="Phòng Sạch">Phòng Sạch</option>
              </select>
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Tìm tên, mã sản phẩm..." value={listSearch} onChange={e => setListSearch(e.target.value)} className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 font-medium" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Sản phẩm</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Phân loại / Brand</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Specs chính</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">P/P & Giá</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                 {filteredList.map(prod => (
                   <tr key={prod.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${selectedProductId === prod.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                           {prod.images?.[0] && <img src={typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url} alt="" className="w-full h-full object-cover" />}
                       </div>
                       <div>
                            <span className="block font-bold text-slate-900 dark:text-white">{prod.name}</span>
                            <span className="text-xs text-slate-500">{prod.id.split('-')[0]}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="block font-medium text-slate-900 dark:text-white mb-1">{prod.category}</span>
                        <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded">{prod.brand || 'No Brand'}</span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
                         {prod.specs?.['Độ dày'] && <p>Dày: {prod.specs['Độ dày']}</p>}
                         {prod.specs?.['Cấu trúc'] && <p>Cấu trúc: {prod.specs['Cấu trúc']}</p>}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="block font-black text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('vi-VN').format(prod.base_price)} đ</span>
                        <span className="text-xs text-slate-500 font-medium">Score: {prod.pp_score}/10</span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => handleEdit(prod)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors inline-block font-bold text-sm">
                         <div className="flex items-center gap-1.5"><Edit className="w-4 h-4" /> Bản chiếu</div>
                       </button>
                       <button onClick={() => handleDelete(prod.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors inline-block">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
                 {filteredList.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                       Không tìm thấy sản phẩm nào khớp với bộ lọc.
                     </td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
