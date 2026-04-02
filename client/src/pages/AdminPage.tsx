import { useState } from "react";

type AdminTab = 'bookings' | 'slots' | 'tickets' | 'operations';

function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('bookings')

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-blue-900">
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage bookings, slots, ticket types, and tour operations.
                </p>
            </div>

            <div className="rounded-xl bg-white/90 p-3 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab("bookings")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "bookings"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Bookings
                    </button>
            
                    <button
                        onClick={() => setActiveTab("slots")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "slots"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Slots
                    </button>
            
                    <button
                        onClick={() => setActiveTab("tickets")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "tickets"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Ticket Types
                    </button>
            
                    <button
                        onClick={() => setActiveTab("operations")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "operations"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Operations
                    </button>
                </div>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-md">
                {activeTab === "bookings" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Bookings
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Booking list will appear here.
                        </p>
                    </div>
                )}
            
                {activeTab === "slots" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Slots
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Slot management will appear here.
                        </p>
                    </div>
                )}
            
                {activeTab === "tickets" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Ticket Types
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Ticket configuration will appear here.
                        </p>
                    </div>
                )}
            
                {activeTab === "operations" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Operations
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Refunds and admin actions will appear here.
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-md">
                <h2 className="text-lg font-semibold text-blue-900">
                    Overview
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    This page will become the main control area for the
                    Stamford Bridge tour system.
                </p>
            </div>
        </section>
    );
}

export default AdminPage;