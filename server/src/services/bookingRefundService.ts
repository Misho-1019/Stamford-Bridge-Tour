import { BookingStatus } from "@prisma/client";
import { prisma } from "../db";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";


export class BookingRefundError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = 'BookingRefundError';
        this.statusCode = statusCode;
    }
}

type RefundBookingParams = {
    bookingId: string;
    reason?: string;
}

export async function refundBookingById({
    bookingId,
    reason,
}: RefundBookingParams) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    })

    if (!booking) {
        throw new BookingRefundError('Booking not found', 404);
    }

    const refundableStatuses: BookingStatus[] = [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
    ]

    if (!refundableStatuses.includes(booking.status)) {
        throw new BookingRefundError('Only confirmed or cancelled bookings can be refunded', 400)
    }

    if (!booking.stripePaymentIntentId) {
        throw new BookingRefundError("Booking has no Stripe payment intent id", 400)
    }

    if (booking.status === BookingStatus.REFUNDED || booking.stripeRefundId) {
        throw new BookingRefundError("Booking has already been refunded", 400)
    }

    let paymentIntent: Stripe.PaymentIntent;

    try {
        paymentIntent = await stripe.paymentIntents.retrieve(
            booking.stripePaymentIntentId,
            {
                expand: ['latest_charge']
            }
        )
    } catch (error) {
        throw new BookingRefundError("Failed to retrieve payment from Stripe", 400)
    }

    if (paymentIntent.status !== 'succeeded') {
        throw new BookingRefundError("Payment is not completed, cannot refund", 400)
    }

    const charge = paymentIntent.latest_charge as Stripe.Charge | null;

    if (!charge) {
        throw new BookingRefundError("No charge found for this payment", 400)
    }

    const refundableAmount = charge.amount - charge.amount_refunded;

    if (refundableAmount <= 0) {
        throw new BookingRefundError("Payment has already been fully refunded", 400)
    }

    let refund: Stripe.Refund;

    try {
        refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundableAmount,
            metadata: {
                bookingId: booking.id,
                slotId: booking.slotId,
                email: booking.email,
                reason: reason ?? '',
            }
        })
    } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
            throw new BookingRefundError(`Stripe refund failed: ${error.message}`, 400)
        }

        throw error;
    }

    const updateBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
            status: BookingStatus.REFUNDED,
            stripeRefundId: refund.id,
            refundedAt: new Date(),
            refundReason: reason ?? null,
        }
    })

    return {
        booking: updateBooking,
        refund,
    }
}