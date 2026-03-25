import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, X, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { createProduct } from '../data/supabase';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setError('');
    
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setError('Failed to parse CSV file. Please check the format.');
          return;
        }
        
        // Map Vietnamese Columns to English DB schema
        const mappedData = results.data.map((row, index) => {
          return {
            _originalId: index,
            name: row['Tên Sản Phẩm'] || row['Name'] || '',
            price_per_m2: parseInt(row['Giá'] || row['Price'] || '0', 10),
            brands: { name: row['Thương Hiệu'] || row['Brand'] || 'Unknown' },
            categories: { name: row['Loại'] || row['Category'] || 'Unknown' },
            description: row['Mô tả'] || row['Description'] || '',
            specs: {
              'Độ dày': row['Độ dày'] || row['Thickness'] || '',
              'Chất liệu': row['Chất liệu'] || row['Material'] || ''
            }
          };
        }).filter(item => item.name); // Filter out empty names
        
        setPreviewData(mappedData);
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!previewData.length) return;
    
    setImporting(true);
    let successCount = 0;
    
    try {
      // Execute inserts sequentially (or via Promise.all)
      for (const item of previewData) {
        await createProduct({
          name: item.name,
          price_per_m2: item.price_per_m2,
          brands: item.brands,
          categories: item.categories,
          description: item.description,
          specs: item.specs,
          images: []
        });
        successCount++;
      }
      alert(`Successfully imported ${successCount} products!`);
      onImportSuccess();
      onClose();
    } catch (err) {
      setError(`Import failed after ${successCount} records: ` + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Bulk Import Products</h3>
              <p className="text-sm text-slate-500 font-medium">Upload a CSV file to add multiple products at once.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          
          {/* File Upload Zone */}
          {!previewData.length && (
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-transform" />
              <label className="cursor-pointer text-center">
                <span className="font-bold text-blue-700 text-lg block mb-1">Click to browse or drag CSV file here</span>
                <span className="text-sm text-slate-500 font-medium">Required columns: Tên Sản Phẩm, Thương Hiệu, Loại, Giá</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-semibold border border-red-100">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {/* Data Preview Table */}
          {previewData.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end">
                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Preview Detected Data
                </h4>
                <span className="text-sm font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                  {previewData.length} Valid Records Found
                </span>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Tên Sản Phẩm</th>
                      <th className="px-6 py-4">Thương Hiệu</th>
                      <th className="px-6 py-4">Danh Mục</th>
                      <th className="px-6 py-4 text-right">Giá (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewData.slice(0, 10).map((row) => (
                      <tr key={row._originalId} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-semibold text-slate-800">{row.name}</td>
                        <td className="px-6 py-3 text-blue-600 font-medium">{row.brands.name}</td>
                        <td className="px-6 py-3 text-slate-600">{row.categories.name}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-700">{new Intl.NumberFormat('vi-VN').format(row.price_per_m2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="p-3 bg-slate-50 text-center text-xs font-semibold text-slate-500 border-t border-slate-200">
                    Showing top 10 results. {previewData.length - 10} more hidden.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={importing}
            className="px-6 py-2.5 font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleConfirmImport} 
            disabled={!previewData.length || importing}
            className="px-8 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            {importing ? (
              <>Processing...</>
            ) : (
              <>
                <Database className="w-4 h-4" /> 
                Confirm Import {previewData.length} records
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
