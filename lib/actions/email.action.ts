"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not configured. Email not sent.");
      return { success: false, message: "Email service not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: from || "GermanyFormation <noreply@germanyformation.com>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      return { success: false, error };
    }

    console.log("✅ Email sent successfully:", { to, subject, id: data?.id });
    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Exception sending email:", error);
    return { success: false, error: error.message };
  }
}
