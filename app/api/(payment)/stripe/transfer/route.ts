import { TUser } from "@/types/models.types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest, res: NextResponse) {
  const { instructor, amount }: { instructor: TUser; amount: number } =
    await req.json();

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      destination: instructor!.stripeId!,
      transfer_group: "ORDER100",
    });

    return NextResponse.json({
      status: "success",
      message: "Transfer created successfully.",
      data: transfer,
    });
  } catch (error: any) {
    console.error("Error creating transfer:", error);
    return NextResponse.json({
      status: "error",
      message:
        "An error occurred when creating the transfer. Please try again later.",
    });
  }
}
