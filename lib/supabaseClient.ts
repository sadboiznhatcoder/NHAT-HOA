import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Thiếu biến môi trường Supabase. Vui lòng cập nhật .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy-build.supabase.co', 
  supabaseKey || 'dummy-key'
);
