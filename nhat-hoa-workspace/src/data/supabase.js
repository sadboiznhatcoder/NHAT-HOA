import { createClient } from '@supabase/supabase-js';
import { mockProducts } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';
const isMock = supabaseUrl.includes('mock-url');

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchProducts() {
  if (isMock) {
    await new Promise(r => setTimeout(r, 500));
    return [...mockProducts];
  }
  const { data, error } = await supabase.from('products').select(`*, brands(name, logo), categories(name)`);
  if (error) throw error;
  return data;
}

export async function createProduct(productData) {
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    const newProduct = { 
      ...productData, 
      id: Math.random().toString(36).substr(2, 9),
      brands: { name: 'Unknown Brand' },
      categories: { name: 'Unknown Category' }
    };
    mockProducts.push(newProduct);
    return newProduct;
  }
  const { data, error } = await supabase.from('products').insert([productData]).select();
  if (error) throw error;
  return data[0];
}

export async function updateProduct(id, updates) {
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index > -1) {
      mockProducts[index] = { ...mockProducts[index], ...updates };
      return mockProducts[index];
    }
    throw new Error('Product not found in mock state');
  }
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deleteProduct(id) {
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index > -1) mockProducts.splice(index, 1);
    return true;
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}
