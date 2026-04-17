# ⚽ Stamford Bridge Tour Booking System

### Full-Stack Ticket Booking & Payment Platform

A production-oriented full-stack web application designed to manage **tour bookings, ticket selection, and secure payments** for Stamford Bridge stadium tours.

This project focuses on **real-world booking workflows, payment processing with Stripe, authentication security, and scalable backend architecture** — not just UI demonstration.

---

## 🎯 Project Purpose

Booking systems for events or tours often require coordination between availability, pricing, and secure payment processing.

**Stamford Bridge Tour Booking System** centralizes this process by allowing users to:

* browse available tour slots by date
* select ticket types and quantities
* complete secure payments via Stripe
* manage their bookings
* provide admins with visibility and control over reservations

The system was built to simulate **real-world booking and payment scenarios**, including webhook-based confirmation and concurrency-safe seat allocation.

---

## 🚀 Core Features

### Client (Public)

* Browse available slots by selected date
* View ticket types with dynamic pricing
* Real-time total price calculation
* Secure checkout via Stripe
* Authentication (register / login)
* View personal bookings
* Cancel bookings

### Admin

* Secure admin authentication
  n- View all bookings with pagination
* Booking management (cancel/refund)
* Analytics dashboard:

  * Revenue overview
  * Booking trends
  * Ticket type performance
  * Slot utilization

### Payments & Automation

* Stripe Checkout integration
* Webhook-based booking confirmation (`checkout.session.completed`)
* Safe booking creation only after successful payment
* Refund handling via webhook events
* Server-side validation for booking integrity

---

## 🌐 Live Demo

* **Frontend:** [https://stamford-bridge-tour.vercel.app](https://stamford-bridge-tour.vercel.app)
* **Backend API:** [https://stamford-bridge-tour.onrender.com](https://stamford-bridge-tour.onrender.com)

> ⚠️ Note:
> This is a portfolio deployment.
> The backend is hosted on a free tier (Render), so cold starts may occur after inactivity.

---

## 🖼️ Screenshots

### 1️⃣ Booking Page (Slots & Ticket Selection)

![Booking Page](views/Screenshot%202026-04-17%20191551.png)
![Booking Page](views/Screenshot%202026-04-17%20191600.png)

### 2️⃣ Ticket Selection & Summary

![Tickets](views/Screenshot%202026-04-17%20192302.png)

### 3️⃣ Stripe Checkout Flow

![Checkout](views/Screenshot%202026-04-17%20191808.png)

### 4️⃣ User Bookings

![My Bookings](views/Screenshot%202026-04-17%20192119.png)

### 5️⃣ Admin Dashboard

![Admin Dashboard](views/Screenshot%202026-04-17%20192230.png)

### 6️⃣ Admin Analytics

![Analytics](views/Screenshot%202026-04-17%20192244.png)

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* React Router
* Custom API layer with cookie-based auth handling

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* Zod validation
* JWT authentication with refresh token rotation

### Database

* PostgreSQL (Supabase)

### Payments

* Stripe Checkout
* Stripe Webhooks

---

## 🏗️ Architecture Overview

The application follows a clean client–server architecture:

* The frontend handles UI rendering, user interaction, and request orchestration.
* The backend exposes a REST API responsible for:

  * authentication
  * booking logic
  * payment session creation
  * webhook processing
  * validation and security
* Stripe webhooks act as the **source of truth** for completed payments.
* Booking creation occurs only after successful webhook confirmation.
* Prisma manages database interactions with transactional safety.

This mirrors real-world systems where payment confirmation is asynchronous and must be handled securely.

---

## 🗄️ Booking Flow (Important)

1. User selects slot and tickets
2. Backend creates a **hold** and Stripe Checkout session
3. User completes payment in Stripe
4. Stripe sends webhook (`checkout.session.completed`)
5. Backend validates event and creates booking
6. Booking becomes visible to user/admin

---

## 🔒 Security Considerations

* JWT-based authentication (access + refresh tokens)
* Refresh token rotation with database tracking
* HTTP-only cookies for secure session handling
* CORS restricted to trusted origins
* Stripe webhook signature verification
* Rate limiting applied to authentication endpoints
* Server-side validation for all booking operations

---

## ▶️ Running Locally

### 1️⃣ Backend

```bash
cd server
npm install
npm run dev
```

### 2️⃣ Frontend

```bash
cd client
npm install
npm run dev
```

### 3️⃣ Stripe Webhooks (Local Development)

```bash
stripe listen --forward-to localhost:8080/webhooks/stripe
```

---

## 🌱 Future Improvements

* Email notifications for booking confirmations
* Admin filtering and advanced analytics
* Slot capacity visualization improvements
* Better loading and error UX states
* Mobile UX enhancements

---

## 👤 Author Note

Built with a production mindset, focusing on real-world booking workflows, payment processing reliability, and secure full-stack architecture.

This project demonstrates practical experience with **payments, webhooks, authentication, and deployment across multiple services**, reflecting real production scenarios beyond basic CRUD applications.
