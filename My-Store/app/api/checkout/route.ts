import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, 
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "idr", 
        product_data: {
          name: `${item.name} (Ukuran: ${item.size || "Default"})`,
          // Mencegah error jika image_url kosong/bermasalah
          ...(item.image_url && { images: [item.image_url] }), 
        },
        // PERBAIKAN FATAL: Kalikan 100 karena Stripe menganggap IDR punya 2 desimal
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    // Gunakan fallback origin yang aman
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}