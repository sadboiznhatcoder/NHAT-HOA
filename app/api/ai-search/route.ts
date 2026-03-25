import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'none',
});

export async function POST(req: Request) {
  try {
    const { query, activeContext } = await req.json();

    const systemPrompt = `Bạn là Trợ lý Ảo AI cao cấp của hãng "Nhật Hoa ICT". 
Bạn CHỈ ĐƯỢC PHÉP tư vấn dựa trên danh sách dữ liệu sản phẩm định dạng JSON được cung cấp dưới đây:
[DATA_BẢN_QUYỀN_START]
${JSON.stringify(activeContext || [], null, 2)}
[DATA_BẢN_QUYỀN_END]

CÁC QUY TẮC CỐT LÕI MÀ BẠN PHẢI TUÂN THỦ TUYỆT ĐỐI!
1. NẾU thông tin khách hỏi KHÔNG tồn tại trong danh sách dữ liệu trên, bạn phải lịch sự trả lời: "Xin lỗi, hệ thống Nhật Hoa hiện chưa cập nhật dữ liệu về loại sàn này." KHÔNG ĐƯỢC BỊA ĐẶT THÊM SẢN PHẨM KHÔNG CÓ TRONG JSON.
2. Về Toán Tử So sánh Giá & Hiệu năng (P/P): Nếu khách yêu cầu tìm sàn "Tốt", "Rẻ", hay "P/P Ngon", hãy tính toán bằng cách lọc những sản phẩm có [pp_score] > 8 và có [base_price] thấp nhất để gợi ý.
3. Nếu khách yêu cầu "So Sánh": BẮT BUỘC dùng bảng Markdown hoặc các gạch đầu dòng ngắn gọn, rõ ràng (Ưu điểm, Nhược điểm, Mức giá phân khúc...).
4. Mọi lúc khi nhắc đến tên hoặc mã sản phẩm, BẠN PHẢI NHÚNG LINK ẢNH của sản phẩm đó vào văn bản theo cú pháp Markdown: ![Tên Sản Phẩm](URL_Ảnh) (Ưu tiên dùng thuộc tính images[0] hoặc image).
5. Cuối câu trả lời, luôn có phần "💡 Gợi ý thông minh: " để cung cấp 1-2 lời khuyên mở rộng logic. Ví dụ: Nếu khách hỏi sàn thao tác bệnh viện, gợi ý thêm chức năng chống tĩnh điện hoặc kháng khuẩn do mật độ đi lại cao.
6. TRẢ VỀ ĐÚNG 1 ĐỐI TƯỢNG JSON DUY NHẤT (không bọc trong \`\`\`json) với định dạng chính xác sau:
{
  "reply": "Đoạn Markdown phản hồi hoàn chỉnh của bạn (gồm cả Ảnh và Gợi ý thông minh)",
  "product_ids": ["uuid_sản_phẩm_1", "uuid_sản_phẩm_2"] 
}
Lưu ý: Mảng "product_ids" chứa tất cả id sản phẩm bạn đã đề cập hoặc phân tích. Nếu không tìm thấy sản phẩm nào từ JSON phù hợp, mảng "product_ids" để rỗng [].`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query || "Xin chào, Nhật Hoa có những dòng sàn nào nổi bật?" }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1, // very low temp for factual reliability
      response_format: { type: "json_object" },
    });

    const aiResString = chatCompletion.choices[0]?.message?.content || '{}';
    let aiData: any = {};
    
    try {
      aiData = JSON.parse(aiResString);
    } catch (e) {
      aiData = { reply: aiResString, product_ids: [] };
    }

    const returnedIds = aiData.product_ids || [];
    const matchedProducts = (activeContext || []).filter((p: any) => returnedIds.includes(p.id));

    return NextResponse.json({ 
      reply: aiData.reply || "Xin lỗi, đường truyền tín hiệu AI đang bận. Bạn vui lòng thử lại sau.", 
      results: matchedProducts.length > 0 ? matchedProducts : (activeContext || []).slice(0, 4) 
    });

  } catch (error) {
    console.error('Groq Search Error:', error);
    return NextResponse.json({ error: 'AI Error' }, { status: 500 });
  }
}
