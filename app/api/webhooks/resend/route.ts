import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "svix";

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const payload = await req.text();
    const body = JSON.parse(payload);
    
    // Get Svix headers (optional - only for certain Resend events)
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    let evt: any;

    // Check if this is a Svix-signed webhook
    if (svixId && svixTimestamp && svixSignature) {
      // Verify webhook signature using Svix
      const wh = new Webhook(RESEND_WEBHOOK_SECRET);
      try {
        evt = wh.verify(payload, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Webhook verification failed" },
          { status: 401 }
        );
      }
    } else {
      // For email.received events or other non-Svix webhooks, use the body directly
      console.log("ℹ️ Processing webhook without Svix verification");
      evt = body;
    }

    // Parse the event
    const { type, data } = evt;

    console.log("📧 Received Resend webhook:", {
      type,
      from: data?.from,
      to: data?.to,
      subject: data?.subject,
      timestamp: new Date().toISOString(),
    });

    // Handle email.received event
    if (type === "email.received") {
      const { from, to, subject, html, text, reply_to, cc, bcc } = data;

      // Forward the email to your personal email
      const forwardedEmail = await resend.emails.send({
        from: "Support <support@taleldeutchlandservices.com>",
        to: "talel.jouini02@gmail.com",
        reply_to: from, // Allow replying directly to original sender
        subject: `[Forwarded] ${subject || "(No Subject)"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #DC2626; padding: 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
              <h2 style="margin: 0; color: #ffffff;">📧 New Email Received</h2>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <div style="margin-bottom: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 5px 0; color: #374151;"><strong>From:</strong> ${from || "Unknown"}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>To:</strong> ${Array.isArray(to) ? to.join(", ") : to || "support@taleldeutchlandservices.com"}</p>
                ${reply_to ? `<p style="margin: 5px 0; color: #374151;"><strong>Reply-To:</strong> ${reply_to}</p>` : ""}
                ${cc ? `<p style="margin: 5px 0; color: #374151;"><strong>CC:</strong> ${Array.isArray(cc) ? cc.join(", ") : cc}</p>` : ""}
                <p style="margin: 5px 0; color: #374151;"><strong>Subject:</strong> ${subject || "(No Subject)"}</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 12px;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              ${html || text ? `<div style="margin-top: 20px; padding: 20px; border-left: 4px solid #DC2626; background-color: #fef2f2;">
                ${html || `<pre style="white-space: pre-wrap; font-family: monospace;">${text}</pre>`}
              </div>` : ''}
            </div>
            
            <div style="margin-top: 0; padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">💡 <strong>Tip:</strong> Click "Reply" to respond directly to ${from || "the sender"}</p>
              <p style="margin: 5px 0 0 0;">This email was automatically forwarded from support@taleldeutchlandservices.com</p>
            </div>
          </div>
        `,
      });

      if (forwardedEmail.error) {
        console.error("❌ Error forwarding email:", forwardedEmail.error);
        return NextResponse.json(
          { success: false, error: forwardedEmail.error },
          { status: 500 }
        );
      }

      console.log("✅ Email forwarded successfully:", forwardedEmail.data);

      return NextResponse.json({
        success: true,
        message: "Email received and forwarded",
        id: forwardedEmail.data?.id,
      });
    }

    // Handle other event types if needed
    console.log(`ℹ️ Unhandled event type: ${type}`);
    return NextResponse.json({
      success: true,
      message: `Event type ${type} received but not handled`,
    });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for webhook verification
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Resend webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
