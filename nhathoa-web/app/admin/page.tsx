"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, LayoutDashboard, Settings, X } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản Lý Sản Phẩm</h1>
            <p className="text-slate-500 font-medium">Nhập liệu hệ thống vào cơ sở dữ liệu Supabase</p>
          </div>
        </div>

        {status === "success" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            Lưu sản phẩm thành công vào hệ thống!
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500" />
            Lỗi máy chủ: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Thông Tin Cơ Bản
            </h2>
            <button
               type="submit"
               disabled={status === "loading"}
               className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {status === "loading" ? "Đang lưu..." : "Lưu Sản Phẩm"}
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên Sản Phẩm *</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="VD: Sàn Mipolam..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thương Hiệu</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="VD: Gerflor" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Danh Mục *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium">
                  <option>Sàn phòng sạch</option>
                  <option>Sàn thể thao</option>
                  <option>Sàn y tế</option>
                  <option>Thảm văn phòng</option>
                  <option>Sàn công nghiệp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Đơn Giá Cơ Bản (VNĐ) *</label>
                <input required type="number" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="VD: 350000" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Chất Liệu / Cấu Tạo</label>
                <input type="text" value={formData.materials} onChange={(e) => setFormData({...formData, materials: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="VD: 100% Nhựa PVC đồng nhất..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Điểm P/P (1-10)</label>
                <input type="number" min="1" max="10" step="0.1" value={formData.pp_score} onChange={(e) => setFormData({...formData, pp_score: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-blue-600" />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Arrays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Colors */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mã Màu / Tên Màu</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Xanh ngọc..." />
                  <button type="button" onClick={(e) => handleArrayAdd(e, "colors", colorInput, setColorInput)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map(c => (
                    <span key={c} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      {c} <X key={c} onClick={() => removeArrayItem("colors", c)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hình Ảnh URL (Thêm URL online)</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => handleArrayAdd(e, "images", imageInput, setImageInput)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                  <button type="button" onClick={(e) => handleArrayAdd(e, "images", imageInput, setImageInput)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeArrayItem("images", img)} className="absolute inset-0 bg-red-500/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"><Trash2 className="w-5 h-5 text-white" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Dynamic Objects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Specs */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-4">Thông Số Kỹ Thuật (Specs)</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={specKey} onChange={e => setSpecKey(e.target.value)} className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Độ dày" />
                  <input type="text" value={specValue} onChange={e => setSpecValue(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2.0mm" />
                  <button type="button" onClick={(e) => handleObjAdd(e, "specs", specKey, specValue, setSpecKey, setSpecValue)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-sm font-medium bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-slate-500">{k}: <span className="text-slate-900 ml-2">{v}</span></span>
                      <button type="button" onClick={() => removeObjItem("specs", k)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Install Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-4">Yêu cầu Lắp Đặt / Vật Tư (Install)</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={installKey} onChange={e => setInstallKey(e.target.value)} className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Keo dán" />
                  <input type="text" value={installValue} onChange={e => setInstallValue(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.2kg/m2" />
                  <button type="button" onClick={(e) => handleObjAdd(e, "installation_details", installKey, installValue, setInstallKey, setInstallValue)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.installation_details).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-sm font-medium bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-slate-500">{k}: <span className="text-slate-900 ml-2">{v}</span></span>
                      <button type="button" onClick={() => removeObjItem("installation_details", k)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" /></button>
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
