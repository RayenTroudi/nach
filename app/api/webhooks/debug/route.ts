import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    webhook_secret_exists: !!process.env.WEBHOOK_SECRET,
    webhook_secret_prefix: process.env.WEBHOOK_SECRET?.substring(0, 15) || 'NOT SET',
    webhook_secret_length: process.env.WEBHOOK_SECRET?.length || 0,
    expected_prefix: 'whsec_i1e9xWkX',
    match: process.env.WEBHOOK_SECRET?.startsWith('whsec_i1e9xWkX') || false,
  });
}
