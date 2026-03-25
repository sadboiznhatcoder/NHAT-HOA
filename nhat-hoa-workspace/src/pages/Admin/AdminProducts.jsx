import { useState, useMemo, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender 
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../data/supabase';
import { Plus, Edit, Trash2, Search, ArrowUpDown, Upload } from 'lucide-react';
import BulkImportModal from '../../components/BulkImportModal';

export default function AdminProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await fetchProducts();
      setData(prods);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'images',
      header: 'Image',
      cell: ({ row }) => {
        const url = row.original.images?.[0];
        return url ? <img src={url} alt="product" className="w-12 h-12 rounded object-cover border" /> : <div className="w-12 h-12 bg-slate-100 rounded border"></div>;
      }
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-1 font-bold">
          Product Name <ArrowUpDown className="w-4 h-4 ml-1" />
        </button>
      ),
      cell: info => <span className="font-semibold text-slate-800">{info.getValue()}</span>
    },
    {
      accessorFn: row => row.brands?.name || 'Unknown',
      id: 'brand',
      header: 'Brand'
    },
    {
      accessorFn: row => row.categories?.name || 'Unknown',
      id: 'category',
      header: 'Category',
      cell: info => <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{info.getValue()}</span>
    },
    {
      accessorKey: 'price_per_m2',
      header: 'Base Price / m²',
      cell: ({ getValue }) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getValue())
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/products/${row.original.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => handleDelete(row.original.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Sản phẩm</h2>
          <p className="text-slate-500 mt-1 text-lg">Manage all flooring catalog records, specifications, and media.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm transition-colors"
          >
            <Upload className="w-5 h-5 text-blue-600" /> Import CSV
          </button>
          <Link to="/admin/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Add New Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products, brands, categories..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading product inventory...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                     <td colSpan={columns.length} className="p-8 text-center text-slate-500">No products found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onImportSuccess={loadData} 
      />
    </div>
  );
}
