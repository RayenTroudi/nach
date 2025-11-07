import { NextResponse } from "next/server";

// POST /api/contact - Send contact form message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, topic, message } = body;

    // Validation
    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, just log the message
    console.log("Contact Form Submission:", {
      name,
      email,
      topic,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send an email like this:
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Nach Deutschland <noreply@nachdeutschland.com>',
      to: 'contact@nachdeutschland.com',
      subject: `New Contact Form: ${topic}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'Nach Deutschland <noreply@nachdeutschland.com>',
      to: email,
      subject: 'We received your message!',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message about "${topic}" and will get back to you within 24 hours.</p>
        <p>Best regards,<br/>The Nach Deutschland Team</p>
      `,
    });
    */

    return NextResponse.json({
      message: "Contact form submitted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
