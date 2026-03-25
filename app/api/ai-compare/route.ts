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

    const systemPrompt = `Bạn là Chuyên gia Tư vấn Vật liệu Sàn cấp cao của "Nhật Hoa ICT". Nhiệm vụ của bạn là so sánh chuyên sâu các sản phẩm sau (định dạng JSON):
    
${JSON.stringify(products, null, 2)}

Yêu cầu định dạng đầu ra (Markdown Tiếng Việt, ngắn gọn, súc tích):
1. Ưu điểm nổi bật của từng dòng (Dựa trên vật liệu, Spec, Độ dày).
2. Ứng dụng phù hợp nhất (Phòng sạch, y tế, nhà xưởng, văn phòng...).
3. Phân tích P/P (Price/Performance) và Đưa ra Lời khuyên cuối cùng (Khuyên dùng loại nào cho kịch bản nào).
Hãy trả lời một cách cực kỳ chuyên nghiệp, chính xác và không bịa đặt dữ liệu ngoài JSON cung cấp.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Hãy so sánh chi tiết các mẫu sàn này để tôi dễ dàng ra quyết định đầu tư.' }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.2, // Low temp for analytical accuracy
      max_tokens: 1536,
    });

    return NextResponse.json({ reply: chatCompletion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('Groq Compare Error:', error);
    return NextResponse.json({ error: 'Failed to process AI comparison request' }, { status: 500 });
  }
}
