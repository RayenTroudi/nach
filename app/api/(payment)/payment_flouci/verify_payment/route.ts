"use server";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { paymentId }: { paymentId: string } = await req.json();
  const url = `https://developers.flouci.com/api/verify_payment/${paymentId}`;
  const payload = {};

  try {
    const { data } = await axios({
      method: "get",
      url: url,
      data: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        apppublic: process.env.NEXT_PUBLIC_FLOUCI_PUBLIC_TOKEN,
        appsecret: process.env.FLOUCI_SECRET_TOKEN,
      },
    });

    console.log("RESPONSE", data);

    return NextResponse.json(
      { success: data.success, result: data.result },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("ERROR WITH THIS PAYMENT ID", paymentId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
