"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, LayoutDashboard, Settings, X, UploadCloud, FileText } from "lucide-react";
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
    images: [] as string[],
    installation_details: {} as Record<string, string>,
    specs: {} as Record<string, string>,
  });

  const [colorInput, setColorInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [installKey, setInstallKey] = useState("");
  const [installValue, setInstallValue] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleArrayAdd = (
    e: React.KeyboardEvent | React.MouseEvent,
    field: "colors" | "images",
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
    field: "specs" | "installation_details",
    key: string,
    value: string,
    setKey: React.Dispatch<React.SetStateAction<string>>,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    if (key.trim() && value.trim()) {
      setFormData({
        ...formData,
        [field]: { ...formData[field], [key.trim()]: value.trim() }
      });
      setKey("");
      setValue("");
    }
  };

  const removeArrayItem = (field: "colors" | "images", item: string) => {
    setFormData({ ...formData, [field]: formData[field].filter((i) => i !== item) });
  };

  const removeObjItem = (field: "specs" | "installation_details", key: string) => {
    const newObj = { ...formData[field] };
    delete newObj[key];
    setFormData({ ...formData, [field]: newObj });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const submissionData = {
      ...formData,
      base_price: Number(formData.base_price) || 0,
    };

    const { error } = await supabase.from("products").insert([submissionData]);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({
        name: "", brand: "", category: "Sàn phòng sạch", base_price: "",
        materials: "", pp_score: 5, colors: [], images: [],
        installation_details: {}, specs: {}
      });
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cổng Quản Lý Sản Phẩm</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Nhập liệu và đồng bộ hệ thống Supabase</p>
            </div>
          </div>
          <a href="/" className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Quay lại trang chủ
          </a>
        </div>

        {status === "success" && (
          <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm">
            <CheckCircle2 className="w-6 h-6" /> Đã lưu hồ sơ sản phẩm an toàn!
          </div>
        )}

        {status === "error" && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 font-bold shadow-sm">
            <AlertCircle className="w-6 h-6" /> Lỗi máy chủ: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          
          <div className="bg-slate-900 dark:bg-slate-950 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-b border-slate-800">
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4 sm:mb-0">
              <Settings className="w-6 h-6 text-blue-400" /> Bảng Nhập Liệu
            </h2>
            <button
               type="submit"
               disabled={status === "loading"}
               className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-black flex justify-center items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-blue-500/20 disabled:scale-100 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {status === "loading" ? "Đang xử lý..." : "Lưu Sản Phẩm"}
            </button>
          </div>

          <div className="p-8 lg:p-10 space-y-10">
            
            {/* Visual Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                  <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xl">Tải lên Hình ảnh (.jpg, .png)</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Kéo thả album ảnh vào đây hoặc nhấp để Duyệt</p>
                <input type="file" multiple accept=".jpg,.png,.jpeg" className="hidden" />
              </label>

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-4 bg-rose-100 dark:bg-rose-900/40 rounded-full mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                  <FileText className="w-10 h-10 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xl">Chứng nhận / CO-CQ (.pdf)</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Kéo thả các tài liệu PDF xác minh vào đây</p>
                <input type="file" multiple accept=".pdf" className="hidden" />
              </label>
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
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Danh Mục *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-bold">
                  <option>Sàn phòng sạch</option>
                  <option>Sàn thể thao</option>
                  <option>Sàn y tế</option>
                  <option>Thảm văn phòng</option>
                  <option>Sàn công nghiệp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Điểm Hiệu năng (1-10)</label>
                <input type="number" min="1" max="10" step="0.1" value={formData.pp_score} onChange={(e) => setFormData({...formData, pp_score: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 text-emerald-600 dark:text-emerald-400 transition-all font-black" />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Arrays & Custom Dynamics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                <label className="block text-base font-black text-slate-800 dark:text-slate-200 mb-4">Các Mã Màu Sản Phẩm</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="VD: 5507 Xanh ngọc..." />
                  <button type="button" onClick={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl transition-colors shadow-lg"><Plus className="w-6 h-6" /></button>
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
                <label className="block text-base font-black text-slate-800 dark:text-slate-200 mb-4">Nhập Specs Động (Mở Rộng)</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={specKey} onChange={e => setSpecKey(e.target.value)} className="w-2/5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="Chỉ số kháng khuẩn" />
                  <input type="text" value={specValue} onChange={e => setSpecValue(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-bold" placeholder="ISO 22196" />
                  <button type="button" onClick={(e) => handleObjAdd(e, "specs", specKey, specValue, setSpecKey, setSpecValue)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 rounded-xl transition-colors shadow-lg"><Plus className="w-6 h-6" /></button>
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
      </div>
    </div>
  );
}
