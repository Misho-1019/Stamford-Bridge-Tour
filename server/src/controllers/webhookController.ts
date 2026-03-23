import { Router } from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";

const webhookController = Router();

webhookController.post('/stripe', async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET is not configured" })
    }

    let event: Stripe.Event;

    try {
        const signature = req.headers['stripe-signature'];

        if (!signature || typeof signature !== 'string') {
            return res.status(400).json({ error: 'Missing Stripe signature' })
        }

        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
        )
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error);
        return res.status(400).json({ error: "Invalid webhook signature" });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            if (!session.id) {
                return res.status(400).json({ error: 'Missing session id' })
            }

            const existingBooking = await prisma.booking.findUnique({
                where: {
                    stripeSessionId: session.id,
                },
            })

            if (existingBooking) {
                return res.status(200).json({ received: true, duplicate: true })
            }

            const hold = await prisma.hold.findUnique({
                where: {
                    stripeSessionId: session.id,
                }
            })

            if (!hold) {
                return res.status(200).json({ received: true, skipped: 'hold_not_found' })
            }

            await prisma.$transaction(async (tx) => {
                const bookingAlreadyExists = await tx.booking.findUnique({
                    where: {
                        stripeSessionId: session.id,
                    },
                })

                if (bookingAlreadyExists) {
                    return;
                }

                await tx.booking.create({
                    data: {
                        slotId: hold.slotId,
                        email: hold.email,
                        items: hold.items as Prisma.InputJsonValue,
                        qtyTotal: hold.qtyTotal,
                        amountTotalCents: hold.amountTotalCents,
                        status: 'CONFIRMED',
                        stripeSessionId: session.id,
                        stripePaymentIntentId:
                            typeof session.payment_intent === 'string'
                                ? session.payment_intent
                                : session.payment_intent?.id ?? null,
                    },
                });

                await tx.hold.update({
                    where: { id: hold.id },
                    data: {
                        status: 'CONVERTED',
                    }
                })
            })

            return res.status(200).json({ received: true })
        }

        if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;

            if (!session.id) {
                return res.status(400).json({ error: "Missing session id" });
            }

            const hold = await prisma.hold.findUnique({
                where: {
                    stripeSessionId: session.id,
                }
            })

            if (!hold) {
                return res.status(200).json({ received: true, skipped: "hold_not_found" });
            }

            await prisma.hold.update({
                where: { id: hold.id },
                data: {
                    status: 'EXPIRED',
                },
            })

            return res.status(200).json({ received: true })
        }
        
        if (event.type === 'charge.refunded') {
            const charge = event.data.object as Stripe.Charge;
        
            const paymentIntentId =
                typeof charge.payment_intent === 'string'
                    ? charge.payment_intent
                    : charge.payment_intent?.id;
        
            if (!paymentIntentId) {
                return res.status(200).json({
                    received: true,
                    skipped: 'payment_intent_not_found',
                });
            }
        
            const refundId = charge.refunds?.data?.[0]?.id ?? null;
        
            const booking = await prisma.booking.findFirst({
                where: {
                    stripePaymentIntentId: paymentIntentId,
                },
            });
        
            if (!booking) {
                return res.status(200).json({
                    received: true,
                    skipped: 'booking_not_found',
                });
            }
        
            if (booking.status === 'REFUNDED') {
                return res.status(200).json({
                    received: true,
                    duplicate: true,
                });
            }
        
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: 'REFUNDED',
                    stripeRefundId: refundId ?? booking.stripeRefundId,
                    refundedAt: booking.refundedAt ?? new Date(),
                    refundReason: booking.refundReason,
                },
            });
        
            return res.status(200).json({ received: true });
        }
    } catch (error) {
        console.error("Stripe webhook handling failed:", error);
        return res.status(500).json({ error: "Webhook handling failed" });
    }
})

export default webhookController;