"use server";
import ReplyToCommentEmail from "@/components/shared/ReplyToCommentEmail";
import { TComment, TCourse, TReply } from "@/types/models.types";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const {
    comment,
    course,
    reply,
    mode,
  }: { comment: TComment; course: TCourse; reply: TReply; mode: string } =
    await req.json();

  console.log("THIS IS FROM API COMMENT : ", comment);
  console.log("THIS IS FROM API COURSE : ", course);
  console.log("THIS IS FROM API RePLY : ", reply);

  try {
    const data = await resend.emails.send({
      from: "GermanPath Platform <onboarding@resend.dev>",
      to: comment.user.email,
      subject: `${reply.owner.username} replied to your ${comment.title} comment!`,
      react: ReplyToCommentEmail({ comment, course, reply, mode }),
    });
    return NextResponse.json({ message: "Success", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
