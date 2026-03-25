import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'no_key', // prevent crash without env
});

export async function POST(req) {
  try {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      return NextResponse.json({ reply: '[Mock Mode] API Key missing. Please set NEXT_PUBLIC_GROQ_API_KEY in .env.local to use actual Groq API. Received your context of ' + (await req.json()).activeContext?.length + ' products.' });
    }

    const { message, activeContext } = await req.json();

    const systemPrompt = `You are an expert flooring consultant for "Nhật Hoa". You must only recommend products based on the following JSON dataset, which represents the user's currently filtered products on their screen:
    
${JSON.stringify(activeContext, null, 2)}

Your task: Read the JSON specs dynamically. Compare the price and price/performance (pp_score). Recommend the best fit for their question.
Rules:
1. Answer fully in Vietnamese.
2. Be concise and professional. Use markdown formatting for readability (bolding product names, bullet lists).
3. DO NOT invent or recommend products that are NOT present in the JSON above.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 1024,
    });

    return NextResponse.json({ reply: chatCompletion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'System encountering high load. Please try again.' }, { status: 500 });
  }
}
