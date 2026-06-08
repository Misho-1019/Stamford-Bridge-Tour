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

    const itemsHtml = params.items
        .map(
            (item) =>
                `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">${item.ticketName}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center">×${item.qty}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${formatPriceCents(item.unitPriceCents * item.qty)}</td></tr>`
        )
        .join("");

    const { error } = await resend.emails.send({
        from: "Stamford Bridge Tours <onboarding@resend.dev>",
        to: params.email,
        subject: "Booking Confirmed — Stamford Bridge Tour",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
<tr><td style="background:#1e3a5f;padding:24px;text-align:center">
<h1 style="margin:0;color:#ffffff;font-size:20px">Booking Confirmed ✓</h1>
<p style="margin:8px 0 0;color:#94a3b8;font-size:14px">Stamford Bridge Stadium Tour</p>
</td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 16px;color:#475569;font-size:14px">Your tour booking has been confirmed.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px">
<tr><td style="padding:12px;background:#f8fafc">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:#64748b;font-size:12px;padding:4px 0">Booking ID</td></tr>
<tr><td style="color:#0f172a;font-size:14px;font-weight:600;padding:0 0 8px;word-break:break-all">${params.bookingId}</td></tr>
<tr><td style="color:#64748b;font-size:12px;padding:4px 0">Date &amp; Time</td></tr>
<tr><td style="color:#0f172a;font-size:14px;font-weight:600;padding:0 0 8px">${formatDate(params.slotStartAt)} — ${formatDate(params.slotEndAt)}</td></tr>
<tr><td style="color:#64748b;font-size:12px;padding:4px 0">Tickets</td></tr>
<tr><td style="padding:0">
<table width="100%" cellpadding="0" cellspacing="0">
<tr style="color:#64748b;font-size:12px"><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">Type</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center">Qty</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">Total</td></tr>
${itemsHtml}
</table>
</td></tr>
<tr><td style="padding:8px 0 0;border-top:2px solid #e2e8f0;text-align:right;font-size:15px;font-weight:700;color:#0f172a">Total: ${formatPriceCents(params.amountTotalCents)}</td></tr>
</table>
</td></tr>
</table>
<div style="margin-top:8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;text-align:center">
<p style="margin:0;color:#9a3412;font-size:13px">Please arrive 15 minutes before your scheduled tour time.</p>
</div>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px;text-align:center">
<p style="margin:0;color:#94a3b8;font-size:12px">Stamford Bridge, Fulham Rd., London SW6 1HS</p>
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
