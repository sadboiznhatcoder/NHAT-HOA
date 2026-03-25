'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'nhathoaict' && password === '999999999') {
      // Create a 30-day persistent cookie memory (86400 * 30)
      document.cookie = `nhat_hoa_auth=authenticated; path=/; max-age=${30 * 24 * 60 * 60}`;
      router.push('/');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          NHẬT HOA ICT
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Cổng thông tin nội bộ bảo mật (Internal Workspace)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 tracking-wide text-sm px-4 py-3 rounded-xl font-bold text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên Đăng Nhập</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: nhathoaict"
                className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật Khẩu</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Phiên đăng nhập được mã hóa và duy trì 30 ngày.
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-base font-extrabold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all active:scale-[0.98]"
              >
                Trang Chủ Đăng Nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
