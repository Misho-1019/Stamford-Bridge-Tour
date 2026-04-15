import { Link } from "react-router";

function HomePage() {
    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-blue-900">
                    Stamford Bridge Stadium Tours
                </h1>

                <p className="max-w-2xl text-slate-700">
                    Experience the home of Chelsea FC like never before. Explore the stadium,
                    walk through the tunnel, and discover the history behind one of football’s
                    most iconic venues.
                </p>

                <div>
                    <Link
                        to="/book"
                        className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                    >
                        Book a Tour
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-900">
                        Guided Experience
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Enjoy a professionally guided tour of Stamford Bridge.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-900">
                        Flexible Tickets
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Choose from adult, child, and student ticket options.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-semibold text-blue-900">
                        Secure Booking
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Fast and secure online payments with instant confirmation.
                    </p>
                </div>
            </div>

            {/* Flex: The Only Club to Win It All */}
            <div className="rounded-xl bg-linear-to-r from-blue-900 to-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold">
                    🏆 The Only Club in History to Win Every Trophy
                </h2>
                <p className="mt-2 text-blue-100">
                    From the Premier League to the Champions League, the FA Cup to the Club World Cup —
                    Chelsea is the first and only club in world football to have won every single trophy
                    available. This is history. This is Stamford Bridge.
                </p>
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-blue-50 p-6 text-center">
                <h2 className="text-xl font-semibold text-blue-900">
                    Ready to explore Stamford Bridge?
                </h2>

                <p className="mt-2 text-sm text-slate-700">
                    Book your tour in just a few clicks.
                </p>

                <Link
                    to="/book"
                    className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white transition hover:bg-blue-800"
                >
                    Start Booking
                </Link>
            </div>
        </div>
    );
}

export default HomePage;