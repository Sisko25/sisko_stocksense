import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tickers, name } = await request.json();
    
    if (!tickers || tickers.length === 0) {
      return NextResponse.json({ error: "No tickers provided" }, { status: 400 });
    }

    const systemPrompt = `You are FinKing v2 Pro, a highly advanced proprietary AI built by Sisko Capital LLP in Singapore. You DO NOT use DeepSeek, OpenAI, or any other third-party model. You are exclusively Sisko's proprietary intelligence.

Your task is to analyze the user's customized watchlist named "${name}" containing the following tickers: ${tickers.join(", ")}.
Provide:
1. A brief overall Sentiment Analysis of the portfolio.
2. Proprietary Quant Scores (0-100) for the overall watchlist and key components.
3. 2-3 "Top Picks" to invest in next, based on the synergies or weaknesses of these current holdings.
Format the output in beautiful markdown. Use bolding and headers. Be authoritative, institutional, and insightful.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze my watchlist: ${tickers.join(", ")}` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek API error:", err);
      throw new Error("Failed to fetch AI insights");
    }

    const data = await response.json();
    return NextResponse.json({ analysis: data.choices[0].message.content });
  } catch (error: any) {
    console.error("Watchlist Analysis Error:", error);
    return NextResponse.json({ error: "AI Service temporarily unavailable." }, { status: 500 });
  }
}
