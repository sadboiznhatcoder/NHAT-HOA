"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, LayoutDashboard, Settings, X, UploadCloud, Edit, Search, Filter, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Sàn phòng sạch",
    base_price: "",
    materials: "",
    pp_score: 5,
    colors: [] as string[],
    images: [] as string[], // Already uploaded URLs
    installation_details: {} as Record<string, string>,
    specs: {} as Record<string, string>,
  });

  // Admin Product List States
  const [productsList, setProductsList] = useState<any[]>([]);
  const [listSearch, setListSearch] = useState("");
  const [listCategory, setListCategory] = useState("Tất cả");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Dynamic Array/Object inputs
  const [colorInput, setColorInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Storage Upload States (Delayed Upload)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProductsList(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const maxRemaining = 50 - formData.images.length - pendingFiles.length;
    if (maxRemaining <= 0) return;

    const newFiles = Array.from(e.target.files).slice(0, maxRemaining);
    if (newFiles.length === 0) return;

    setPendingFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));
  };

  const handleEdit = (prod: any) => {
    setSelectedProductId(prod.id);
    setFormData({
      name: prod.name || "",
      brand: prod.brand || "",
      category: prod.category || "Sàn phòng sạch",
      base_price: prod.base_price ? prod.base_price.toString() : "",
      materials: prod.materials || "",
      pp_score: prod.pp_score || 5,
      colors: prod.colors || [],
      images: prod.images || [],
      installation_details: prod.installation_details || {},
      specs: prod.specs || {}
    });
    setPendingFiles([]);
    setPreviewUrls(old => { old.forEach(URL.revokeObjectURL); return []; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSelectedProductId(null);
    setFormData({
      name: "", brand: "", category: "Sàn phòng sạch", base_price: "",
      materials: "", pp_score: 5, colors: [], images: [],
      installation_details: {}, specs: {}
    });
    setPendingFiles([]);
    setPreviewUrls(old => { old.forEach(URL.revokeObjectURL); return []; });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  const handleArrayAdd = (
    e: React.KeyboardEvent | React.MouseEvent,
    field: "colors",
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (input.trim() && !formData[field].includes(input.trim())) {
        setFormData({ ...formData, [field]: [...formData[field], input.trim()] });
        setInput("");
      }
    }
  };

  const handleObjAdd = (
    e: React.MouseEvent,
    key: string,
    value: string,
    setKey: React.Dispatch<React.SetStateAction<string>>,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    if (key.trim() && value.trim()) {
      setFormData({
        ...formData,
        specs: { ...formData.specs, [key.trim()]: value.trim() }
      });
      setKey("");
      setValue("");
    }
  };

  const removeArrayItem = (field: "colors" | "images", item: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }));
  };

  const removeObjItem = (field: "specs" | "installation_details", key: string) => {
    setFormData(prev => {
      const newObj = { ...prev[field] };
      delete newObj[key];
      return { ...prev, [field]: newObj };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      let finalImages = [...formData.images];
      
      // Execute Delayed Upload
      if (pendingFiles.length > 0) {
        setUploadProgress({ current: 0, total: pendingFiles.length });
        
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { data, error } = await supabase.storage.from('product-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
          
          if (!error && data) {
            const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(filePath);
            finalImages.push(publicData.publicUrl);
          }
          setUploadProgress({ current: i + 1, total: pendingFiles.length });
        }
      }

      const submissionData = {
        ...formData,
        images: finalImages,
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
    const matchesCat = listCategory === "Tất cả" || p.category === listCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* === HEADER === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trung Tâm Quản Lý</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Đồ án kỹ thuật & danh mục sàn Nhật Hoa</p>
            </div>
          </div>
          <a href="/" className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Quay lại trang chủ
          </a>
        </div>

        {/* === ALERTS === */}
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

        {/* === FORM SECTION (CREATE / UPDATE) === */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          
          {/* Progress Overlay */}
          {status === "loading" && uploadProgress.total > 0 && (
            <div className="absolute inset-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center">
               <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
               <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Đang đồng bộ hóa kho dữ liệu...</p>
               <p className="text-blue-600 dark:text-blue-400 font-bold mb-4">Upload ảnh {uploadProgress.current} / {uploadProgress.total}</p>
               <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
               </div>
            </div>
          )}

          <div className={`bg-slate-900 dark:bg-slate-950 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 transition-colors ${selectedProductId ? 'bg-indigo-900 dark:bg-indigo-950 outline outline-4 outline-indigo-500/30 -outline-offset-4' : ''}`}>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4 sm:mb-0">
              <Settings className={`w-6 h-6 ${selectedProductId ? 'text-indigo-400' : 'text-blue-400'}`} /> 
              {selectedProductId ? `Đang chỉnh sửa: ${formData.name || 'Sản phẩm'}` : 'Tạo Sản Phẩm Mới'}
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              {selectedProductId && (
                <button type="button" onClick={handleReset} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors">
                  Hủy / Tạo Mới
                </button>
              )}
              <button
                 type="submit"
                 disabled={status === "loading"}
                 className={`flex-1 sm:flex-none ${selectedProductId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-8 py-3.5 rounded-xl font-black flex justify-center items-center gap-2 transition-transform shadow-lg disabled:opacity-50`}
              >
                 <Save className="w-5 h-5" /> {selectedProductId ? "Cập Nhật Bộ Hồ Sơ" : "Lưu Sản Phẩm Mới"}
              </button>
            </div>
          </div>

          <div className="p-8 lg:p-10 space-y-10">
            {/* Visual Upload Zones with Delayed Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50 h-full min-h-[250px]">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                  <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xl">Chọn Khối Lượng Ảnh Mới</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Chọn tối đa 50 file (.jpg, .png)</p>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              <div className="border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 h-full flex flex-col min-h-[250px]">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span>Kho Ảnh Hiện Ráp (Preview)</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-black">{formData.images.length + pendingFiles.length} Tổng</span>
                </h3>
                
                {formData.images.length === 0 && pendingFiles.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm font-medium">Chưa có ảnh nào được ánh xạ</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                    {/* Da Up len cloud */}
                    {formData.images.map((img, i) => (
                      <div key={`cloud-${i}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeUploadedImage(img)} className="absolute inset-0 bg-red-600/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex backdrop-blur-sm">
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                    {/* Dang cho (Pre-upload) */}
                    {previewUrls.map((url, i) => (
                      <div key={`pending-${i}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-amber-300 dark:border-amber-600 group">
                        <div className="absolute top-1 right-1 z-10 w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500" title="Chờ Upload"></div>
                        <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
                        <button type="button" onClick={() => removePendingFile(i)} className="absolute inset-0 bg-red-600/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex backdrop-blur-sm">
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Basic Info */}
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest pl-2 border-l-4 border-blue-500">Thuộc tính Kỹ thuật</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên Sản Phẩm *</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-bold" placeholder="VD: Sàn Mipolam..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đơn Giá Cơ Bản (VNĐ) *</label>
                <input required type="number" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-blue-600 dark:text-blue-400 transition-all font-black" placeholder="350000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thương Hiệu</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-bold" placeholder="VD: Gerflor" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Danh Mục (Phân cấp chính) *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-bold">
                  <option>Sàn phòng sạch</option>
                  <option>Sàn thể thao</option>
                  <option>Sàn y tế</option>
                  <option>Sàn vinyl cuộn</option>
                  <option>Thương mại & Văn phòng</option>
                  <option>Công nghiệp nhẹ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hệ Số P/P Đầu Tư (1-10)</label>
                <input type="number" min="1" max="10" step="0.1" value={formData.pp_score} onChange={(e) => setFormData({...formData, pp_score: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-emerald-600 dark:text-emerald-400 transition-all font-black" />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Arrays & Custom Dynamics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                <label className="block text-base font-black text-slate-800 dark:text-slate-200 mb-4">Tracking Các Mã Màu</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="VD: 5507 Xanh ngọc..." />
                  <button type="button" onClick={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 rounded-xl transition-colors"><Plus className="w-6 h-6" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((c, i) => (
                    <span key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-sm">
                      {c} <X onClick={() => removeArrayItem("colors", c)} className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" />
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                <label className="block text-base font-black text-slate-800 dark:text-slate-200 mb-4">Nhúng Cấu Trúc Specs (JSONB)</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={specKey} onChange={e => setSpecKey(e.target.value)} className="w-2/5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="Kháng thuốc đỏ" />
                  <input type="text" value={specValue} onChange={e => setSpecValue(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="Chuẩn ISO / Betadine" />
                  <button type="button" onClick={(e) => handleObjAdd(e, specKey, specValue, setSpecKey, setSpecValue)} className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-5 rounded-xl transition-colors shadow-lg"><Plus className="w-6 h-6" /></button>
                </div>
                <div className="space-y-3">
                  {Object.entries(formData.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{k}: <span className="text-slate-900 dark:text-white font-black ml-2 text-base">{v}</span></span>
                      <button type="button" onClick={() => removeObjItem("specs", k)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-5 h-5 text-red-500" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* === PRODUCT LIST VIEW (ADMIN CMS) === */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
           <div className="bg-slate-100 dark:bg-slate-950 px-8 py-8 border-b border-slate-200 dark:border-slate-800">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Kho Thư Viện Tổng</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Hiện có <span className="text-blue-600 dark:text-blue-400 font-bold">{filteredList.length}</span> danh mục trên đám mây</p>
                </div>
                
                <div className="flex w-full sm:w-auto gap-4">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm theo tên/brand..." value={listSearch} onChange={e => setListSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-medium" />
                  </div>
                  <div className="relative flex-1 sm:w-48">
                    <Filter className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={listCategory} onChange={e => setListCategory(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-medium appearance-none">
                      <option>Tất cả</option>
                      <option>Sàn phòng sạch</option>
                      <option>Sàn thể thao</option>
                      <option>Sàn y tế</option>
                      <option>Sàn vinyl cuộn</option>
                      <option>Thương mại & Văn phòng</option>
                    </select>
                  </div>
                </div>
             </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
                 <tr>
                   <th className="px-6 py-4">Sản Phẩm</th>
                   <th className="px-6 py-4">Brand</th>
                   <th className="px-6 py-4">Danh Mục</th>
                   <th className="px-6 py-4 text-right">Base Price</th>
                   <th className="px-6 py-4 text-center">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {filteredList.map(prod => (
                   <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                           {prod.images?.[0] && <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />}
                         </div>
                         <span className="font-bold text-slate-900 dark:text-white">{prod.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{prod.brand || 'N/A'}</td>
                     <td className="px-6 py-4">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">{prod.category}</span>
                     </td>
                     <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-slate-200">
                       {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.base_price)}
                     </td>
                     <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEdit(prod)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                           <Edit className="w-5 h-5" />
                         </button>
                         <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                           <Trash2 className="w-5 h-5" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
                 
                 {filteredList.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                       Không tìm thấy mã vật tư nào khớp với điều kiện lọc.
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
