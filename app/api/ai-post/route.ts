import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'none' });

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
       return NextResponse.json({ error: "Missing Supabase URL/Key Configuration." }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rawText } = await req.json();

    if (!rawText) return NextResponse.json({ error: "No raw text provided." }, { status: 400 });

    const systemPrompt = `Bạn là Trí tuệ Nhân tạo Xử lý Dữ liệu của Hệ thống "Nhật Hoa".
Nhiệm vụ: Trích xuất thông tin kỹ thuật từ ĐOẠN TEXT ĐẦU VÀO và trả về chính xác một JSON schema dùng để Insert trực tiếp vào cơ sở dữ liệu Supabase của sản phẩm Sàn.

QUY TẮC MAPPING ĐỊNH DẠNG:
- brand: (Chuỗi string, VD: "Tarkett", "LG Hausys", "Suminoe", "NAKA CORP"...)
- name: (Tên mã sản phẩm)
- category: CHỈ CHỌN 1 TRONG CÁC GIÁ TRỊ SAU NẾU TRÙNG KHỚP (Sàn Y Tế, Sàn Thể Thao, Sàn Văn Phòng, Sàn Công Nghiệp, Sàn Giao Thông, Sàn Nâng, Clean Room, Thảm, Sàn Đặc Biệt, Khác).
- materials: (Mô tả, cấu tạo hoặc ưu điểm tổng quan bằng text)
- Độ dày: TRÍCH XUẤT ĐỘ DÀY (Thickness) (VD: "2.0mm", "3.0mm", "4.5mm", "5.0mm", "8.0mm", Khác)
- Lớp bảo vệ: TRÍCH XUẤT WEAR LAYER (VD: "0.1mm", "0.3mm", "0.5mm", "0.7mm", "1.0mm", Khác)
- Cấu trúc: CHỈ CHỌN (Sàn cuộn, Sàn tấm, Sàn thanh, Sàn hèm khóa, Sàn nâng)
- Kiểu lắp đặt: CHỈ CHỌN (Dán keo, Hèm khóa, Tự dính, Đặt rời)
- Công năng: Chuỗi các tính năng (Kháng khuẩn, Chống tĩnh điện, Chịu lực cao, Chống trơn trượt, Cách âm, Chống cháy). VD: "Kháng khuẩn, Chống tĩnh điện"

TOÀN BỘ OUT PHẢI TUÂN THEO CẤU TRÚC JSON SAU (KHÔNG WRAP BẰNG \`\`\`json):
{
  "name": "...",
  "brand": "...",
  "category": "...",
  "materials": "...",
  "base_price": 0,
  "pp_score": 8,
  "specs": {
     "Độ dày": "...",
     "Lớp bảo vệ": "...",
     "Cấu trúc": "...",
     "Kiểu lắp đặt": "...",
     "Công năng": "..."
  }
}
LƯU Ý: Nếu không tìm thấy thông tin nào đó, trả về Null hoặc rỗng thay vì bịa đặt.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawText }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const aiResString = chatCompletion.choices[0]?.message?.content || '{}';
    let payload;
    try {
       payload = JSON.parse(aiResString);
    } catch(e) {
       return NextResponse.json({ error: "AI failed to generate valid JSON schema" }, { status: 500 });
    }

    // Default missing fields required by Supabase Schema
    const dbObject = {
       name: payload.name || "Sản phẩm chưa đặt tên",
       brand: payload.brand || "",
       category: payload.category || "Khác",
       materials: payload.materials || "",
       specs: payload.specs || {},
       base_price: payload.base_price || 0,
       pp_score: payload.pp_score || 5,
       colors: [],
       images: [],
       installation_details: {}
    };

    const { data: insertedData, error } = await supabase.from('products').insert([dbObject]).select();

    if (error) {
       return NextResponse.json({ error: "Supabase Insertion Failed: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, insertedId: insertedData[0].id });

  } catch (error: any) {
    console.error('AI POST Protocol Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
