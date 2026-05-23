import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key", {
  apiVersion: "2026-04-22.dahlia", // matching installed stripe package typings
});

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sisko Premium Access",
              description: "Unlock Real-time DeepSeek v4 Pro AI Insights, Proprietary Quant Scores, and Institutional Summaries.",
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
