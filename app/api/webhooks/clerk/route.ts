import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/actions/email.action';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);

    if (!primaryEmail) {
      return new Response('No primary email', { status: 200 });
    }

    // Check if password was changed by looking at the updated_at timestamp
    // This is a simplified check - you might need more sophisticated logic
    const wasPasswordChanged = evt.data.password_enabled && 
      evt.data.updated_at && 
      new Date(evt.data.updated_at).getTime() > Date.now() - 60000; // Changed in last minute

    if (wasPasswordChanged) {
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
                Hello ${first_name || ''},
              </p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Your password for your TDS account has been successfully changed.
              </p>
              
              <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; color: #1565C0; margin: 0;">
                  <strong>✓ Security Update:</strong> Your password was changed on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666;">
                <strong>Didn't make this change?</strong><br>
                If you didn't change your password, please contact our support team immediately and secure your account.
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

      await sendEmail({
        to: primaryEmail.email_address,
        subject: "Your TDS Password Has Been Changed",
        html: emailHtml,
        from: "TDS - Talel Deutschland Services <noreply@taleldeutchlandservices.com>",
      });
    }
  }

  return new Response('', { status: 200 });
}
