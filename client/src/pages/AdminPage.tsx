function AdminPage() {
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-blue-900">
                        Bookings
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        View and manage customer bookings.
                    </p>
                </div>

                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-blue-900">
                        Slots
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Review availability and scheduled tours.
                    </p>
                </div>

                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-blue-900">
                        Ticket Types
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Configure ticket options and pricing.
                    </p>
                </div>

                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-blue-900">
                        Operations
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Handle refunds and administrative actions.
                    </p>
                </div>
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