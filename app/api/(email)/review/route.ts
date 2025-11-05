"use server";
import { NextRequest, NextResponse } from "next/server";
import Email from "@/components/shared/Email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { status, course, message, mode } = await req.json();

  try {
    const data = await resend.emails.send({
      from: "GermanPath Platform <onboarding@resend.dev>",
      to: course.instructor.email,
      subject: `${course.title} Course ${status[0].toUpperCase()}${status.slice(
        1
      )}`,
      react: Email({ status, course, message, mode }),
    });
    console.log("REQUEST BODY : ", data);

    return NextResponse.json({ message: "Success", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
