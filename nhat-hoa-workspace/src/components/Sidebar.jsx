import { NavLink } from 'react-router-dom';
import { Home, Package, GitCompare, FileText, Settings, Layers, Bot, Database } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Product Library', path: '/products', icon: Package },
    { name: 'Comparison Tool', path: '/compare', icon: GitCompare },
    { name: 'AI Assistant', path: '/ai-filter', icon: Bot },
    { name: 'Quotes', path: '/quotes', icon: FileText },
    { name: 'Admin CMS', path: '/admin/products', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col shadow-sm">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Nhật Hoa</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t text-xs text-slate-400 text-center">
        Nhật Hoa Workspace v1.0.0
      </div>
    </div>
  );
}
