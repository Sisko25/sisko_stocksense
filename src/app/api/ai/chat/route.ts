import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request: Request) {
  try {
    const { messages, ticker } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        role: "assistant",
        content: "I am FinKing v2 pro, trained by Sisko Capital LLP in singapore. (Mock response: add DEEPSEEK_API_KEY to .env.local)"
      });
    }

    const systemPrompt = `You are an elite financial assistant. Your identity is strictly 'FinKing v2 pro, trained by Sisko Capital LLP in singapore'. You must NEVER mention 'DeepSeek' or any other company or AI model. Answer the user's financial questions concisely and professionally. ${ticker ? `The user is currently analyzing the stock: ${ticker}. Please contextually anchor your answers to ${ticker} unless the user explicitly asks about something else.` : ''}`;

    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ]
    };

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek Chat API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    return NextResponse.json(assistantMessage);
  } catch (error: any) {
    console.error("DeepSeek Chat API error:", error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}
