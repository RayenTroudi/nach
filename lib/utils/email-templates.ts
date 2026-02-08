/**
 * Email Templates for Payment Notifications
 * Domain: taleldeutchlandservices.com
 */

const BRAND_NAME = "Talel Deutschland Services";
const SUPPORT_EMAIL = "talel.jouini02@gmail.com";
const WEBSITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://taleldeutchlandservices.com";

// Common email styles
const emailStyles = {
  container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;',
  header: 'background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;',
  headerTitle: 'color: white; margin: 0; font-size: 28px; font-weight: 700;',
  body: 'padding: 40px 30px; background: #f9fafb;',
  content: 'background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);',
  button: 'display: inline-block; background: #1e40af; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0;',
  buttonSuccess: 'display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0;',
  buttonDanger: 'display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0;',
  infoBox: 'background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;',
  warningBox: 'background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;',
  successBox: 'background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;',
  dangerBox: 'background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;',
  footer: 'padding: 20px 30px; background: #f3f4f6; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px;',
  table: 'width: 100%; border-collapse: collapse;',
  tableRow: 'border-bottom: 1px solid #e5e7eb;',
  tableLabel: 'padding: 12px 0; color: #6b7280; font-weight: 500;',
  tableValue: 'padding: 12px 0; color: #1f2937; font-weight: 600; text-align: right;',
};

interface PaymentRequestToAdminParams {
  userName: string;
  userEmail: string;
  itemType: 'course' | 'document' | 'bundle' | 'meeting' | 'resume';
  itemNames: string[];
  amount: number;
  paymentProofUrl: string;
  proofId: string;
  submittedAt: Date;
  userNotes?: string;
}

export function getPaymentRequestToAdminEmail(params: PaymentRequestToAdminParams): string {
  const {
    userName,
    userEmail,
    itemType,
    itemNames,
    amount,
    paymentProofUrl,
    proofId,
    submittedAt,
    userNotes,
  } = params;

  const itemTypeLabel = itemType === 'meeting' ? 'Consultation Meeting' : 
                        itemType === 'resume' ? 'Resume Service' :
                        itemType === 'course' ? 'Course' :
                        itemType === 'bundle' ? 'Document Bundle' : 'Document';

  const reviewUrl = `${WEBSITE_URL}/teacher/dashboard`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Payment Request</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.headerTitle}">🔔 New Payment Request</h1>
          </div>
          
          <div style="${emailStyles.body}">
            <div style="${emailStyles.infoBox}">
              <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                ⚡ Action Required: A new payment proof needs your review
              </p>
            </div>

            <div style="${emailStyles.content}">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Customer Information</h2>
              <table style="${emailStyles.table}">
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Customer Name</td>
                  <td style="${emailStyles.tableValue}">${userName}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Email</td>
                  <td style="${emailStyles.tableValue}">${userEmail}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Submitted</td>
                  <td style="${emailStyles.tableValue}">${submittedAt.toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}</td>
                </tr>
              </table>
            </div>

            <div style="${emailStyles.content}">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Payment Details</h2>
              <table style="${emailStyles.table}">
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Item Type</td>
                  <td style="${emailStyles.tableValue}">${itemTypeLabel}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Items</td>
                  <td style="${emailStyles.tableValue}">${itemNames.join(', ')}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Amount</td>
                  <td style="${emailStyles.tableValue}">${amount} TND</td>
                </tr>
                <tr>
                  <td style="${emailStyles.tableLabel}">Payment Proof</td>
                  <td style="${emailStyles.tableValue}">
                    <a href="${paymentProofUrl}" style="color: #1e40af; text-decoration: none; font-weight: 600;">View Proof</a>
                  </td>
                </tr>
              </table>
              ${userNotes ? `
                <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">Customer Note:</p>
                  <p style="margin: 8px 0 0 0; color: #1f2937;">${userNotes}</p>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" style="${emailStyles.button}">
                Review Payment Request →
              </a>
            </div>

            <div style="${emailStyles.warningBox}">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⏰ Please review this payment within 24-48 hours</strong><br>
                The customer is waiting for your approval to access their purchase.
              </p>
            </div>
          </div>

          <div style="${emailStyles.footer}">
            <p style="margin: 0;">
              ${BRAND_NAME}<br>
              This is an automated notification from your payment system
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface PaymentApprovedToUserParams {
  userName: string;
  itemType: 'course' | 'document' | 'bundle' | 'meeting' | 'resume';
  itemNames: string[];
  amount: number;
  accessUrl: string;
  adminNotes?: string;
  meetingLink?: string;
  meetingDate?: Date;
  meetingTime?: string;
}

export function getPaymentApprovedToUserEmail(params: PaymentApprovedToUserParams): string {
  const {
    userName,
    itemType,
    itemNames,
    amount,
    accessUrl,
    adminNotes,
    meetingLink,
    meetingDate,
    meetingTime,
  } = params;

  const itemTypeLabel = itemType === 'meeting' ? 'Consultation Meeting' : 
                        itemType === 'resume' ? 'Resume Service' :
                        itemType === 'course' ? 'Course' :
                        itemType === 'bundle' ? 'Document Bundle' : 'Document';

  const accessLabel = itemType === 'meeting' ? 'Join Your Meeting' :
                      itemType === 'resume' ? 'Access Your Service' :
                      itemType === 'course' ? 'Start Learning' :
                      'Access Your Content';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Approved</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${emailStyles.container}">
          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.headerTitle}">✅ Payment Approved!</h1>
          </div>
          
          <div style="${emailStyles.body}">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 10px;">
              Hi ${userName},
            </p>
            
            <div style="${emailStyles.successBox}">
              <p style="margin: 0; color: #15803d; font-size: 16px; font-weight: 600;">
                🎉 Great news! Your payment has been verified and approved.
              </p>
            </div>

            <div style="${emailStyles.content}">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Purchase Confirmed</h2>
              <table style="${emailStyles.table}">
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Item Type</td>
                  <td style="${emailStyles.tableValue}">${itemTypeLabel}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Items</td>
                  <td style="${emailStyles.tableValue}">${itemNames.join(', ')}</td>
                </tr>
                <tr>
                  <td style="${emailStyles.tableLabel}">Amount Paid</td>
                  <td style="${emailStyles.tableValue}">${amount} TND</td>
                </tr>
              </table>
            </div>

            ${meetingLink && meetingDate && meetingTime ? `
              <div style="${emailStyles.content}">
                <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">📅 Your Meeting Details</h2>
                <table style="${emailStyles.table}">
                  <tr style="${emailStyles.tableRow}">
                    <td style="${emailStyles.tableLabel}">Date</td>
                    <td style="${emailStyles.tableValue}">${meetingDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</td>
                  </tr>
                  <tr>
                    <td style="${emailStyles.tableLabel}">Time</td>
                    <td style="${emailStyles.tableValue}">${meetingTime}</td>
                  </tr>
                </table>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="${meetingLink}" style="${emailStyles.buttonSuccess}">
                    📹 Join Meeting
                  </a>
                  <p style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                    Meeting Link: <a href="${meetingLink}" style="color: #1e40af;">${meetingLink}</a>
                  </p>
                </div>
              </div>
            ` : `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${accessUrl}" style="${emailStyles.buttonSuccess}">
                  ${accessLabel} →
                </a>
              </div>
            `}

            ${adminNotes ? `
              <div style="${emailStyles.warningBox}">
                <p style="margin: 0; color: #92400e;">
                  <strong>📝 Note from Admin:</strong><br>
                  ${adminNotes}
                </p>
              </div>
            ` : ''}

            ${itemType === 'meeting' ? `
              <div style="${emailStyles.infoBox}">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Tips for a great meeting:</p>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                  <li>Test your camera and microphone before the meeting</li>
                  <li>Join a few minutes early</li>
                  <li>Find a quiet location with good lighting</li>
                  <li>Have your questions ready</li>
                </ul>
              </div>
            ` : ''}

            <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">
              Thank you for choosing ${BRAND_NAME}! If you have any questions, feel free to reach out.
            </p>
          </div>

          <div style="${emailStyles.footer}">
            <p style="margin: 0 0 10px 0;">
              ${BRAND_NAME}
            </p>
            <p style="margin: 0; font-size: 13px;">
              Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #1e40af;">${SUPPORT_EMAIL}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface PaymentRejectedToUserParams {
  userName: string;
  itemType: 'course' | 'document' | 'bundle' | 'meeting' | 'resume';
  itemNames: string[];
  amount: number;
  adminNotes?: string;
  resubmitUrl: string;
}

export function getPaymentRejectedToUserEmail(params: PaymentRejectedToUserParams): string {
  const {
    userName,
    itemType,
    itemNames,
    amount,
    adminNotes,
    resubmitUrl,
  } = params;

  const itemTypeLabel = itemType === 'meeting' ? 'Consultation Meeting' : 
                        itemType === 'resume' ? 'Resume Service' :
                        itemType === 'course' ? 'Course' :
                        itemType === 'bundle' ? 'Document Bundle' : 'Document';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Review Required</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${emailStyles.container}">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="${emailStyles.headerTitle}">⚠️ Payment Review Required</h1>
          </div>
          
          <div style="${emailStyles.body}">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 10px;">
              Hi ${userName},
            </p>
            
            <div style="${emailStyles.dangerBox}">
              <p style="margin: 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                We've reviewed your payment proof and need additional information.
              </p>
            </div>

            <div style="${emailStyles.content}">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Payment Details</h2>
              <table style="${emailStyles.table}">
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Item Type</td>
                  <td style="${emailStyles.tableValue}">${itemTypeLabel}</td>
                </tr>
                <tr style="${emailStyles.tableRow}">
                  <td style="${emailStyles.tableLabel}">Items</td>
                  <td style="${emailStyles.tableValue}">${itemNames.join(', ')}</td>
                </tr>
                <tr>
                  <td style="${emailStyles.tableLabel}">Amount</td>
                  <td style="${emailStyles.tableValue}">${amount} TND</td>
                </tr>
              </table>
            </div>

            ${adminNotes ? `
              <div style="${emailStyles.warningBox}">
                <p style="margin: 0 0 5px 0; color: #92400e; font-weight: 600; font-size: 15px;">
                  📋 Reason for Review:
                </p>
                <p style="margin: 0; color: #78350f; font-size: 15px;">
                  ${adminNotes}
                </p>
              </div>
            ` : ''}

            <div style="${emailStyles.infoBox}">
              <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">What to do next:</p>
              <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                <li>Review the reason above</li>
                <li>Prepare a clearer payment proof or receipt</li>
                <li>Upload a new payment proof</li>
                <li>Or contact support if you need assistance</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resubmitUrl}" style="${emailStyles.button}">
                Upload New Payment Proof →
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #1e40af;">${SUPPORT_EMAIL}</a>
            </p>
          </div>

          <div style="${emailStyles.footer}">
            <p style="margin: 0;">
              ${BRAND_NAME}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
