import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'none',
});

export async function POST(req: Request) {
  try {
    const { products } = await req.json();

    if (!products || products.length < 2) {
      return NextResponse.json({ error: "Yêu cầu tối thiểu 2 sản phẩm để so sánh." }, { status: 400 });
    }

    const systemPrompt = `Bạn là Chuyên gia Tư vấn Vật liệu Sàn cấp cao của "Nhật Hoa ICT". Nhiệm vụ tối thượng của bạn là so sánh và trả lời chính xác 3 câu hỏi sau đối với dữ liệu các sản phẩm được cung cấp:

DỮ LIỆU SẢN PHẨM HIỆN TẠI ĐỂ BẠN PHÂN TÍCH:
${JSON.stringify(products, null, 2)}

YÊU CẦU TRẢ LỜI CỤ THỂ 3 CÂU HỎI BẰNG TIẾNG VIỆT (Dùng Markdown):
1. Cấu trúc bảng biểu So Sánh Các Thông số chi tiết (về Độ dày, Wear Layer, Công năng).
2. TRẢ LỜI CHÍNH XÁC: Loại nào bền hơn? (Dựa vào Wear Layer, Độ dày và Công năng, Thương hiệu).
3. TRẢ LỜI CHÍNH XÁC: Loại nào rẻ hơn / P-P Ngon hơn? (Rẻ hơn dựa theo [base_price], P-P Tốt dựa trên base_price thấp + pp_score cao).
4. TRẢ LỜI CHÍNH XÁC: Nên dùng loại nào cho mặt bằng thực tế? (Dựa trên "Công năng" và "Category" của sản phẩm, VD: Sàn Y tế thì tư vấn dùng ở môi trường kháng khuẩn).

Hãy trả lời một cách cực kỳ chuyên nghiệp, chính xác và sử dụng ngữ khí của một kỹ sư tư vấn cao cấp. Không bịa đặt dữ liệu ngoài JSON.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Vui lòng so sánh chi tiết các mã sàn đang chọn để tôi quyết định.' }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1, // Low temp for analytical accuracy
      max_tokens: 1536,
    });

    return NextResponse.json({ reply: chatCompletion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('Groq Compare Error:', error);
    return NextResponse.json({ error: 'Failed to process AI comparison request' }, { status: 500 });
  }
}
