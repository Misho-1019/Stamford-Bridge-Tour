import axios from "axios";
import PDFDocument from "pdfkit";

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

export async function generateTicketPdf(params: {
    bookingId: string;
    email: string;
    slotStartAt: Date;
    slotEndAt: Date;
    qtyTotal: number;
    amountTotalCents: number;
    items: Array<{ ticketName?: string; qty: number; unitPriceCents: number }>;
}): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const buffers: Buffer[] = [];

            doc.on("data", (chunk: Buffer) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            const pageWidth = doc.page.width - 100;
            let y = 50;

            doc.fontSize(22).font("Helvetica-Bold").fillColor("#003399").text("Stamford Bridge", 50, y, { width: pageWidth, align: "center" });
            doc.fontSize(14).font("Helvetica").fillColor("#D4AF37").text("Stadium Tour Ticket", { width: pageWidth, align: "center" });
            y += 60;

            doc.moveTo(50, y).lineTo(545, y).strokeColor("#D4AF37").opacity(0.2).stroke().opacity(1);
            y += 20;

            doc.fontSize(10).font("Helvetica-Bold").fillColor("#D4AF37").text("BOOKING ID", 50, y);
            doc.fontSize(12).font("Helvetica").fillColor("#0f131f").text(params.bookingId, 50, y + 14);
            y += 40;

            doc.fontSize(10).font("Helvetica-Bold").fillColor("#D4AF37").text("DATE & TIME", 50, y);
            doc.fontSize(12).font("Helvetica").fillColor("#0f131f").text(`${formatDate(params.slotStartAt)} — ${formatDate(params.slotEndAt)}`, 50, y + 14);
            y += 40;

            doc.fontSize(10).font("Helvetica-Bold").fillColor("#D4AF37").text("EMAIL", 50, y);
            doc.fontSize(12).font("Helvetica").fillColor("#0f131f").text(params.email, 50, y + 14);
            y += 40;

            doc.moveTo(50, y).lineTo(545, y).strokeColor("#D4AF37").opacity(0.2).stroke().opacity(1);
            y += 20;

            doc.fontSize(10).font("Helvetica-Bold").fillColor("#D4AF37").text("TICKETS", 50, y);
            y += 18;

            for (const item of params.items) {
                doc.fontSize(11).font("Helvetica").fillColor("#0f131f").text(`${item.ticketName || "Ticket"}`, 50, y);
                doc.fontSize(11).font("Helvetica").fillColor("#475569").text(`×${item.qty}`, 400, y, { width: 50, align: "center" });
                doc.fontSize(11).font("Helvetica-Bold").fillColor("#003399").text(formatPriceCents(item.unitPriceCents * item.qty), 450, y, { width: 100, align: "right" });
                y += 20;
            }

            doc.moveTo(50, y).lineTo(545, y).strokeColor("#D4AF37").opacity(0.2).stroke().opacity(1);
            y += 15;

            doc.fontSize(14).font("Helvetica-Bold").fillColor("#D4AF37").text(`Total: ${formatPriceCents(params.amountTotalCents)}`, 350, y, { width: 200, align: "right" });
            y += 50;

            try {
                const qrData = encodeURIComponent(`STAMFORD-BRIDGE:${params.bookingId}:${params.email}`);
                const qrResponse = await axios.get(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`, {
                    responseType: "arraybuffer",
                });
                const qrBuffer = Buffer.from(qrResponse.data);

                const centerX = (doc.page.width - 100) / 2 - 50;
                doc.image(qrBuffer, 50 + centerX, y, { width: 100, height: 100 });
                y += 110;
            } catch {
            }

            doc.moveTo(50, y).lineTo(545, y).strokeColor("#D4AF37").opacity(0.2).stroke().opacity(1);
            y += 15;

            doc.fontSize(10).font("Helvetica").fillColor("#D4AF37").text("Please arrive 15 minutes before your scheduled tour time.", 50, y, { width: pageWidth, align: "center" });
            y += 20;

            doc.fontSize(8).font("Helvetica").fillColor("#94a3b8").text("Stamford Bridge, Fulham Rd., London SW6 1HS", 50, y, { width: pageWidth, align: "center" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}
