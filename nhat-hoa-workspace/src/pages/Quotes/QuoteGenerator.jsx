import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../data/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Calculator, Download, User, Building, MapPin } from 'lucide-react';

export default function QuoteGenerator() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!productId);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    company: '',
    address: '',
    area: 100
  });

  useEffect(() => {
    if (productId) {
      async function load() {
        const data = await fetchProducts();
        setProduct(data.find(p => p.id === productId));
        setLoading(false);
      }
      load();
    }
  }, [productId]);

  const handleChange = (e) => {
    setCustomerInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGeneratePDF = () => {
    if (!product) return;
    
    const doc = new jsPDF();
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    const totalCost = product.price_per_m2 * customerInfo.area;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('NHAT HOA - BAO GIA SAN PHAM', 105, 20, { align: 'center' }); // Using non-accented for default jspdf fonts
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ngay: ${new Date().toLocaleDateString('vi-VN')}`, 195, 30, { align: 'right' });

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('THONG TIN KHACH HANG', 14, 45);
    doc.setFontSize(10);
    doc.text(`Ten/Dai dien: ${customerInfo.name || '...'}`, 14, 53);
    doc.text(`Cong ty: ${customerInfo.company || '...'}`, 14, 61);
    doc.text(`Du an/Hang muc: ${customerInfo.address || '...'}`, 14, 69);

    // Table
    doc.autoTable({
      startY: 80,
      headStyles: { fillColor: [37, 99, 235] },
      head: [['San pham', 'Thuong hieu', 'Don gia / m2', 'Dien tich (m2)', 'Thanh tien']],
      body: [
        [
          product.name,
          product.brands.name,
          formatter.format(product.price_per_m2),
          customerInfo.area,
          formatter.format(totalCost)
        ],
      ],
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable.finalY || 100;
    
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`TONG CONG: ${formatter.format(totalCost)}`, 195, finalY + 15, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Cam on Quy khach da tin tuong Nhat Hoa!', 105, 280, { align: 'center' });

    doc.save(`Bao_Gia_${product.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading Data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Tạo Báo Giá (Quote Generator)</h2>
        <p className="text-slate-500 mt-2">Generate professional PDF quotes for your clients automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Client Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input type="text" name="name" value={customerInfo.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="John Doe" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input type="text" name="company" value={customerInfo.company} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="ABC Corp" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Category / Layout</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input type="text" name="address" value={customerInfo.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="Cleanroom Floor 1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Area (m²)</label>
              <div className="relative">
                <Calculator className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input type="number" name="area" value={customerInfo.area} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="100" />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Product & Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-blue-100 font-semibold mb-4 uppercase tracking-wide text-sm">Selected Product</h3>
            {product ? (
              <div>
                <h4 className="text-2xl font-bold mb-1">{product.name}</h4>
                <p className="text-blue-100 mb-6">{product.brands.name}</p>
                
                <div className="flex justify-between items-center border-t border-blue-500/50 pt-4">
                  <span className="text-blue-200">Unit Price:</span>
                  <span className="font-semibold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_per_m2)} / m²</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-blue-200">
                Please select a product from the Library first.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-medium mb-1">Estimated Total</h3>
            <div className="text-3xl font-bold text-slate-900 mb-6">
              {product 
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_per_m2 * customerInfo.area)
                : '0 ₫'
              }
            </div>
            
            <button 
              onClick={handleGeneratePDF}
              disabled={!product}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm transition-colors"
            >
              <Download className="w-5 h-5" />
              Generate PDF Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
