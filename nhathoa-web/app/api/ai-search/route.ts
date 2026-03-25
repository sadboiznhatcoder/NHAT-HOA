import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, activeContext } = await req.json();
    
    // Simulate AI processing delay (1200ms)
    await new Promise(resolve => setTimeout(resolve, 1200));

    const lowercaseQuery = query.toLowerCase();
    
    // activeContext is the Live Supabase data fetched by the client
    let results = activeContext || [];

    // Fallback/Mock filtering logic representing AI context parsing
    if (lowercaseQuery.includes('sạch') || lowercaseQuery.includes('y tế') || lowercaseQuery.includes('bệnh viện') || lowercaseQuery.includes('kháng khuẩn')) {
      results = results.filter((p: any) => p.category?.toLowerCase().includes('phòng sạch') || p.category?.toLowerCase().includes('y tế'));
    } else if (lowercaseQuery.includes('thể thao') || lowercaseQuery.includes('sân')) {
      results = results.filter((p: any) => p.category?.toLowerCase().includes('thể thao'));
    } else if (lowercaseQuery.includes('văn phòng') || lowercaseQuery.includes('thảm')) {
      results = results.filter((p: any) => p.category?.toLowerCase().includes('văn phòng') || p.name?.toLowerCase().includes('thảm'));
    }

    // If no context matched simply return top 4
    if (results.length > 4) {
      results = results.slice(0,4);
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Lỗi tích hợp API:', error);
    return NextResponse.json({ error: 'Máy chủ hiện đang quá tải. Vui lòng thử lại.' }, { status: 500 });
  }
}
