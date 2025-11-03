"use server";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { amount, courseIds }: { amount: number; courseIds: string[] } = json;

    const url = "https://developers.flouci.com/api/generate_payment";
    const payload = {
      app_token: process.env.NEXT_PUBLIC_FLOUCI_PUBLIC_TOKEN!,
      app_secret: process.env.FLOUCI_SECRET_TOKEN!,
      accept_card: true,
      amount: amount * 1000,
      session_timeout_secs: 1200,
      success_link: `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/flouci/purchase/success/?courseIds=${courseIds.join(",")}`,
      fail_link: `${process.env.NEXT_PUBLIC_SERVER_URL}/flouci/purchase/fail`,
      developer_tracking_id: process.env.FLOUCI_DEVELOPER_TRACKING_ID!,
    };

    const { data } = await axios.post(url, JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json({ data: data.result }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating Flouci payment:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
