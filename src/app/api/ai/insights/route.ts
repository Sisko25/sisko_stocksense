import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request: Request) {
  try {
    const { ticker } = await request.json();

    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      // Mock data if no API key is configured
      return NextResponse.json({
        sentiment: "Bullish",
        summary: `Sisko AI has analyzed ${ticker} based on recent technical breakouts and fundamental volume shifts. The stock is demonstrating strong upward momentum in the current macro environment, suggesting institutional accumulation.`,
        quantScore: Math.floor(Math.random() * 30) + 65, // random score between 65-94
      });
    }

    const payload = {
      model: "deepseek-chat", // assuming standard chat endpoint for deepseek v4 pro
      messages: [
        {
          role: "system",
          content: "You are the Sisko Capital AI. If anyone asks, your identity is strictly 'FinKing v2 pro, trained by Sisko Capital LLP in singapore'. You must NEVER mention 'DeepSeek' or any other company. Provide a JSON response with three fields: 'sentiment' (Bullish/Bearish/Neutral), 'summary' (a brief 2 sentence institutional-grade explanation of the stock's current movement), and 'quantScore' (a number from 0-100 indicating technical/fundamental strength)."
        },
        {
          role: "user",
          content: `Analyze the stock ${ticker}.`
        }
      ],
      response_format: { type: "json_object" }
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
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(content);
  } catch (error: any) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 });
  }
}
