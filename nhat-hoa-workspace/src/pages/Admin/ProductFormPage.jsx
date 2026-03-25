import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchProducts, createProduct, updateProduct } from '../../data/supabase';
import { ArrowLeft, Plus, Trash2, UploadCloud, Save, Image as ImageIcon } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  brands: z.object({ name: z.string().min(1, "Brand is required") }),
  categories: z.object({ name: z.string().min(1, "Category is required") }),
  price_per_m2: z.number().positive("Price must be greater than 0"),
  description: z.string().optional(),
  specs: z.array(
    z.object({
      key: z.string().min(1, "Key is required"),
      value: z.string().min(1, "Value is required")
    })
  )
});

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loadingContext, setLoadingContext] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brands: { name: '' },
      categories: { name: '' },
      price_per_m2: 0,
      description: '',
      specs: [{ key: 'Độ dày', value: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "specs" });

  useEffect(() => {
    if (isEditMode) {
      async function load() {
        const data = await fetchProducts();
        const prod = data.find(p => p.id === id);
        if (prod) {
          const formattedSpecs = Object.entries(prod.specs || {}).map(([k, v]) => ({ key: k, value: v }));
          reset({
            ...prod,
            specs: formattedSpecs.length ? formattedSpecs : [{ key: 'Độ dày', value: '' }]
          });
          setImagePreview(prod.images?.[0] || null);
        }
        setLoadingContext(false);
      }
      load();
    }
  }, [id, isEditMode, reset]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const specsObj = data.specs.reduce((acc, curr) => {
        if(curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {});

      const payload = {
        name: data.name,
        description: data.description,
        price_per_m2: data.price_per_m2,
        specs: specsObj,
        images: imagePreview ? [imagePreview] : [],
        brands: { name: data.brands.name }, 
        categories: { name: data.categories.name }
      };

      if (isEditMode) {
        await updateProduct(id, payload);
        alert('Product updated successfully!');
      } else {
        await createProduct(payload);
        alert('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert('Failed to save product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingContext) return <div className="p-12 text-center animate-pulse font-medium text-slate-500">Loading product editor...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-slate-500 mt-1">Fill out the basic information and custom dynamic specifications.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
              <input {...register('name')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Apollo Vinyl" />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base Price (VND / m²)</label>
              <input type="number" {...register('price_per_m2', { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
              {errors.price_per_m2 && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.price_per_m2.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
              <input {...register('brands.name')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Apollo Floors" />
              {errors.brands?.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.brands.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <input {...register('categories.name')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Medical, Industrial" />
              {errors.categories?.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.categories.name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow" placeholder="Product features, applications, etc..." />
          </div>
        </div>

        {/* Dynamic Specifications Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-800">Technical Specifications</h3>
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">Dynamic Key-Value Docs</span>
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in transition-all">
                <div className="flex-1">
                  <input {...register(`specs.${index}.key`)} placeholder="Key (e.g. Độ dày)" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" />
                  {errors.specs?.[index]?.key && <p className="text-red-500 text-xs mt-1">{errors.specs[index].key.message}</p>}
                </div>
                <div className="flex-1">
                  <input {...register(`specs.${index}.value`)} placeholder="Value (e.g. 2.0mm)" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" />
                  {errors.specs?.[index]?.value && <p className="text-red-500 text-xs mt-1">{errors.specs[index].value.message}</p>}
                </div>
                <button type="button" onClick={() => remove(index)} className="p-3 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors mt-0.5 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => append({ key: '', value: '' })} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-lg border border-indigo-100">
            <Plus className="w-5 h-5" /> Add New Specification
          </button>
        </div>

        {/* Media Upload Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Product Media</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Image Preview */}
            <div className="w-48 h-48 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-slate-300" />
              )}
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Upload Dropzone */}
            <div className="flex-1 w-full">
              <label className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <UploadCloud className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-all" />
                <span className="font-bold text-blue-900 text-lg">Click to upload main image</span>
                <span className="text-sm font-medium text-slate-500 mt-2">Supports JPG, PNG, WEBP (Max 10MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 sticky bottom-6 z-10">
          <Link to="/admin/products" className="px-8 py-3.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3">
            <Save className="w-5 h-5" />
            {saving ? 'Saving to Database...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
