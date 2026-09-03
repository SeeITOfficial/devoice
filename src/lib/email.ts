import { Resend } from "resend";
import QRCode from "qrcode";
import { getServerConfig } from "@/lib/config";

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Core email sender using Resend.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const config = getServerConfig();
  const apiKey = config.resendApiKey;
  const from = config.emailFrom;

  if (!apiKey || !from) {
    const msg = "Email not configured. Set RESEND_API_KEY and EMAIL_FROM environment variables.";
    console.error("[email]", msg);
    return { ok: false, error: msg };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email] Exception:", msg);
    return { ok: false, error: msg };
  }
}

function getBaseUrl(): string {
  return getServerConfig().baseUrl;
}

/**
 * Generates a QR code as a base64 data URI for embedding in emails.
 */
async function qrToDataUri(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    width: 200,
    margin: 1,
    color: { dark: "#0d1a17", light: "#f2e9d8" },
  });
}

/**
 * Workflow 1: Send "Payment Required" email immediately after booking.
 */
export async function sendPaymentRequiredEmail(opts: {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: Date;
  ticketTypeName: string;
  quantity: number;
  totalAmount: number;
  orderId: string;
}): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl();
  const paymentUrl = `${baseUrl}/orders/${opts.orderId}/pay`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f2e9d8;color:#0d1a17;">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b18a3b;margin:0;">De Voice</p>
      <h1 style="font-size:32px;margin:12px 0 8px;font-weight:600;">Complete your payment</h1>
      <p style="margin:0 0 32px;font-size:15px;color:#0d1a17cc;">
        Hi ${opts.customerName}, we have received your booking for <strong>${opts.eventTitle}</strong>. 
        To secure your tickets, please complete your payment.
      </p>
      <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:32px;border:1px solid #e5e0d5;">
        <p style="margin:0 0 8px;font-size:13px;color:#0d1a1799;">Order Summary</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:600;">${opts.quantity} × ${opts.ticketTypeName}</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#c9a24b;">${opts.totalAmount.toLocaleString()} UGX</p>
      </div>
      <div style="text-align:center;">
        <a href="${paymentUrl}" style="display:inline-block;background:#0d1a17;color:#f2e9d8;text-decoration:none;padding:16px 32px;border-radius:99px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;">Pay Now</a>
      </div>
      <p style="margin:32px 0 0;font-size:13px;color:#0d1a1799;text-align:center;">
        Payment is not confirmed until verified by De Voice.
      </p>
    </div>
  `;

  return sendEmail({
    to: opts.to,
    subject: `Action Required: Complete your payment for ${opts.eventTitle}`,
    html,
  });
}

/**
 * Workflow 2: Send "Payment Confirmed" email after admin verifies payment.
 */
export async function sendPaymentConfirmedEmail(opts: {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: Date;
  quantity: number;
  totalAmount: number;
  tickets: Array<{
    ticketCode: string;
    qrToken: string;
    ticketTypeName: string;
  }>;
}): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl();
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(opts.eventDate);

  const ticketBlocks = await Promise.all(
    opts.tickets.map(async (t) => {
      const qrDataUri = await qrToDataUri(t.qrToken);
      return `
        <div style="margin-bottom:24px;padding:24px;background:#fff;border-radius:16px;border:1px solid #e5e0d5;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b18a3b;">${t.ticketTypeName}</p>
          <p style="margin:0 0 4px;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.1em;color:#0d1a17;">Ticket Code: ${t.ticketCode}</p>
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#0d1a1799;">Status: <span style="color:#059669;">PAID / VALID</span></p>
          <img src="${qrDataUri}" width="160" height="160" alt="QR code for ${t.ticketCode}" style="border-radius:8px;display:block;" />
          <p style="margin:12px 0 0;font-size:11px;color:#0d1a1766;">Scan this QR code at the venue entrance</p>
        </div>
      `;
    })
  );

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f2e9d8;color:#0d1a17;">
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b18a3b;margin:0;">De Voice</p>
      <h1 style="font-size:32px;margin:12px 0 8px;font-weight:600;">Your tickets are confirmed!</h1>
      <p style="margin:0 0 32px;font-size:15px;color:#0d1a17cc;">
        Hi ${opts.customerName}, your payment has been confirmed. Your ticket${opts.tickets.length > 1 ? "s are" : " is"} ready below.
      </p>

      <div style="background:#0d1a17;border-radius:20px;padding:28px;margin-bottom:28px;color:#f2e9d8;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a24b;">Event</p>
        <p style="margin:0 0 12px;font-size:24px;font-weight:600;">${opts.eventTitle}</p>
        <p style="margin:0 0 16px;font-size:13px;color:#f2e9d8cc;">${formattedDate}</p>
        
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;display:flex;justify-content:space-between;">
          <div>
            <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;color:#f2e9d899;">Quantity</p>
            <p style="margin:0;font-size:14px;font-weight:600;">${opts.quantity} Ticket${opts.quantity > 1 ? "s" : ""}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;color:#f2e9d899;">Amount Paid</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#c9a24b;">${opts.totalAmount.toLocaleString()} UGX</p>
          </div>
        </div>
      </div>

      <h2 style="font-size:14px;letter-spacing:0.2em;text-transform:uppercase;color:#0d1a1799;margin:0 0 16px;">
        Your Ticket${opts.tickets.length > 1 ? "s" : ""}
      </h2>

      ${ticketBlocks.join("")}

      <div style="margin-top:32px;padding:20px;background:#fff8ee;border-radius:12px;border:1px solid #c9a24b33;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0d1a17;">View your tickets anytime</p>
        <p style="margin:0;font-size:13px;color:#0d1a1799;">
          Visit <a href="${baseUrl}/ticket" style="color:#b18a3b;font-weight:600;">${baseUrl}/ticket</a> and enter your phone number to access all your tickets.
        </p>
      </div>

      <p style="margin:32px 0 0;font-size:11px;color:#0d1a1750;text-align:center;">
        De Voice &mdash; Please bring a screenshot of your QR code or your ticket code to the venue.
      </p>
    </div>
  `;

  return sendEmail({
    to: opts.to,
    subject: `Your tickets for ${opts.eventTitle} — De Voice`,
    html,
  });
}
