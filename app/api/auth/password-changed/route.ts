import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/actions/email.action";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #DD0000 0%, #BB0000 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Changed</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hello ${firstName || 'there'},
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Your password for your TDS account has been successfully changed.
            </p>
            
            <div style="background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 14px; color: #2E7D32; margin: 0;">
                <strong>✓ Security Update:</strong> Your password was changed on ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'long', 
                  timeStyle: 'short',
                  timeZone: 'Europe/Berlin'
                })}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333; font-size: 16px;">Account Security Tips:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #666; font-size: 14px;">
                <li>Use a unique password for your account</li>
                <li>Enable two-factor authentication when available</li>
                <li>Never share your password with anyone</li>
                <li>Update your password regularly</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              <strong>Didn't make this change?</strong><br>
              If you didn't change your password, please contact our support team immediately at 
              <a href="mailto:support@taleldeutchlandservices.com" style="color: #DD0000; text-decoration: none;">support@taleldeutchlandservices.com</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="font-size: 13px; color: #999; margin: 5px 0;">
                © ${new Date().getFullYear()} TDS - Talel Deutschland Services
              </p>
              <p style="font-size: 13px; color: #999; margin: 5px 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail({
      to: email,
      subject: "Your TDS Password Has Been Changed",
      html: emailHtml,
      from: "TDS - Talel Deutschland Services <noreply@taleldeutchlandservices.com>",
    });

    if (!result.success) {
      console.error("Failed to send password changed email:", result.error);
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password changed confirmation sent" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Password changed notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification", details: error.message },
      { status: 500 }
    );
  }
}
