import { generateTicketPdf } from "./pdf";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

function formatPriceCents(cents: number) {
    return `£${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: Date) {
    return iso.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export async function sendBookingConfirmation(params: {
    email: string;
    bookingId: string;
    slotStartAt: Date;
    slotEndAt: Date;
    qtyTotal: number;
    amountTotalCents: number;
    items: Array<{ ticketName?: string; qty: number; unitPriceCents: number }>;
}) {
    if (!resendApiKey) {
        console.log("Email skipping: RESEND_API_KEY not configured");
        return;
    }

    const resend = new Resend(resendApiKey);

    const qrData = encodeURIComponent(`STAMFORD-BRIDGE:${params.bookingId}:${params.email}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

    const itemsHtml = params.items
        .map(
            (item) =>
                `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.70)">${item.ticketName}</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;color:rgba(255,255,255,0.50)">×${item.qty}</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;color:rgba(255,255,255,0.85);font-family:monospace">${formatPriceCents(item.unitPriceCents * item.qty)}</td></tr>`
        )
        .join("");

    let attachments: { filename: string; content: string }[] = [];

    try {
        const pdfBuffer = await generateTicketPdf(params);
        attachments = [{ filename: `ticket-${params.bookingId}.pdf`, content: pdfBuffer.toString("base64") }];
    } catch (error) {
        console.error("PDF generation failed:", error);
    }

    const { error } = await resend.emails.send({
        from: "Stamford Bridge Tours <onboarding@resend.dev>",
        to: params.email,
        subject: "Booking Confirmed — Stamford Bridge Tour",
        attachments,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#0f131f;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
<tr><td style="padding:24px;text-align:center">
<img src="${qrUrl}" alt="Entry QR Code" width="120" height="120" style="display:inline-block;border-radius:8px;border:1px solid rgba(212,175,55,0.2)" />
</td></tr>
<tr><td style="padding:0 24px 8px;text-align:center">
<h1 style="margin:0;color:#D4AF37;font-size:20px;letter-spacing:-0.02em">Booking Confirmed</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.50);font-size:14px">Stamford Bridge Stadium Tour</p>
</td></tr>
<tr><td style="padding:16px 24px">
<p style="margin:0 0 16px;color:rgba(255,255,255,0.60);font-size:14px">Your tour booking has been confirmed.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.06);border-radius:12px">
<tr><td style="padding:16px;background:rgba(255,255,255,0.03)">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Booking ID</td></tr>
<tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:0 0 12px;word-break:break-all;font-family:monospace">${params.bookingId}</td></tr>
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Date &amp; Time</td></tr>
<tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:0 0 12px">${formatDate(params.slotStartAt)} — ${formatDate(params.slotEndAt)}</td></tr>
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Tickets</td></tr>
<tr><td style="padding:0">
<table width="100%" cellpadding="0" cellspacing="0">
<tr style="color:rgba(255,255,255,0.40);font-size:11px"><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Type</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center">Qty</td><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right">Total</td></tr>
${itemsHtml}
</table>
</td></tr>
<tr><td style="padding:12px 0 0;border-top:1px solid rgba(212,175,55,0.2);text-align:right;font-size:15px;font-weight:700;color:#D4AF37;font-family:monospace">Total: ${formatPriceCents(params.amountTotalCents)}</td></tr>
</table>
</td></tr>
</table>
<div style="margin-top:12px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.12);border-radius:10px;padding:12px;text-align:center">
<p style="margin:0;color:rgba(212,175,55,0.7);font-size:13px">Please arrive 15 minutes before your scheduled tour time.</p>
</div>
</td></tr>
<tr><td style="padding:16px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
<p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px">Stamford Bridge, Fulham Rd., London SW6 1HS</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`,
    });

    if (error) {
        console.error("Email send failed:", error);
    } else {
        console.log(`Email sent to ${params.email} for booking ${params.bookingId}`);
    }
}

export async function sendBookingCancellation(params: {
    email: string;
    bookingId: string;
    slotStartAt: Date;
    slotEndAt: Date;
    qtyTotal: number;
    amountTotalCents: number;
}) {
    if (!resendApiKey) {
        console.log("Email skipping: RESEND_API_KEY not configured");
        return;
    }

    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
        from: "Stamford Bridge Tours <onboarding@resend.dev>",
        to: params.email,
        subject: "Booking Cancelled — Stamford Bridge Tour",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#0f131f;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
<tr><td style="padding:24px;text-align:center">
<h1 style="margin:0;color:#EF4444;font-size:20px;letter-spacing:-0.02em">Booking Cancelled</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.50);font-size:14px">Stamford Bridge Stadium Tour</p>
</td></tr>
<tr><td style="padding:16px 24px">
<p style="margin:0 0 16px;color:rgba(255,255,255,0.60);font-size:14px">Your tour booking has been cancelled.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.06);border-radius:12px">
<tr><td style="padding:16px;background:rgba(255,255,255,0.03)">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Booking ID</td></tr>
<tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:0 0 12px;word-break:break-all;font-family:monospace">${params.bookingId}</td></tr>
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Date &amp; Time</td></tr>
<tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:0 0 12px">${formatDate(params.slotStartAt)} — ${formatDate(params.slotEndAt)}</td></tr>
<tr><td style="color:rgba(255,255,255,0.40);font-size:11px;padding:4px 0;text-transform:uppercase;letter-spacing:0.05em">Tickets</td></tr>
<tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:0 0 8px">${params.qtyTotal} ticket(s)</td></tr>
<tr><td style="padding:12px 0 0;border-top:1px solid rgba(239,68,68,0.2);text-align:right;font-size:15px;font-weight:700;color:#EF4444;font-family:monospace">Total: ${formatPriceCents(params.amountTotalCents)}</td></tr>
</table>
</td></tr>
</table>
<div style="margin-top:12px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.12);border-radius:10px;padding:12px;text-align:center">
<p style="margin:0;color:rgba(239,68,68,0.7);font-size:13px">Refund (if applicable) will be handled separately.</p>
</div>
</td></tr>
<tr><td style="padding:16px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)">
<p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px">Stamford Bridge, Fulham Rd., London SW6 1HS</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`,
    });

    if (error) {
        console.error("Cancellation email failed:", error);
    } else {
        console.log(`Cancellation email sent to ${params.email} for booking ${params.bookingId}`);
    }
}
