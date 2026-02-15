import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/actions/email.action";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email in Clerk
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (!users || users.length === 0) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        { success: true, message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    const user = users[0];

    // Create a password reset ticket using Clerk's API
    // This generates a URL that allows the user to reset their password
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 86400, // 24 hours
    });

    // The reset URL will use Clerk's ticket parameter to sign in, then redirect to password change
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (!appUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL for password reset link");
      return NextResponse.json(
        { error: "Password reset is not configured" },
        { status: 500 }
      );
    }

    const redirectUrl = `${appUrl}/reset-password`;
    const resetUrl = `${appUrl}/sign-in?__clerk_ticket=${signInToken.token}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #DD0000 0%, #BB0000 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hello,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              We received a request to reset your password for your TDS account. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #DD0000 0%, #BB0000 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(221, 0, 0, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            
            <p style="font-size: 13px; color: #0066cc; word-break: break-all; background: white; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              <strong>Didn't request this?</strong><br>
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              This link will expire in 24 hours for security reasons.
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
      subject: "Reset Your Password - TDS",
      html: emailHtml,
      from: "TDS - Talel Deutschland Services <noreply@taleldeutchlandservices.com>",
    });

    if (!result.success) {
      console.error("Failed to send reset email:", result.error);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Password reset link sent to your email" 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request", details: error.message },
      { status: 500 }
    );
  }
}
