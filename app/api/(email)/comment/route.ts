"use server";
import CommentEmail from "@/components/shared/CommentEmail";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { user, course, comment, mode } = await req.json();

  try {
    const data = await resend.emails.send({
      from: "GermanPath Platform <onboarding@resend.dev>",
      to: course.instructor.email,
      subject: `${user.username} just commented on your course ${course.title}!`,
      react: CommentEmail({ user, course, comment, mode }),
    });
    return NextResponse.json({ message: "Success", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
