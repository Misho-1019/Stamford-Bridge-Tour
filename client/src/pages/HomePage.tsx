import { useEffect } from "react";
import { Link } from "react-router";

function HomePage() {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const reveals = document.querySelectorAll(".reveal");
        reveals.forEach((el, index) => {
            if (index > 0) {
                (el as HTMLElement).style.transitionDelay = `${(index % 3) * 100}ms`;
            }
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="custom-scrollbar">
            {/* Hero Section */}
            <section className="reveal flex min-h-[calc(100dvh-56px)] flex-col justify-center pt-8">
                <div className="max-w-2xl">
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#D4AF37', fontFamily: 'JetBrains Mono, monospace' }}>
                        THE LEGENDARY HOME OF CHELSEA FC
                    </p>
                    <h1 className="text-4xl font-bold leading-none tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-7xl" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        STAMFORD
                        <br />
                        BRIDGE
                    </h1>
                    <p className="mt-8 max-w-lg text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Experience the history, the passion, and the prestige of one of the world's most iconic football stadiums. Walk the tunnel, touch the turf, and live the blue dream.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link
                            to="/book"
                            className="group inline-flex items-center gap-2 rounded-xl border px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(212,175,55,0.1)] active:translate-y-0"
                            style={{
                                borderColor: 'rgba(212,175,55,0.4)',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(20px)',
                                color: '#D4AF37'
                            }}
                        >
                            Book Your Tour
                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            to="/my-bookings"
                            className="rounded-xl border px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.08)] active:translate-y-0"
                            style={{
                                borderColor: 'rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(20px)',
                                color: 'rgba(255,255,255,0.70)'
                            }}
                        >
                            Explore Museum
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trivia Section */}
            <section className="reveal mt-6">
                <div className="glass-card grid grid-cols-1 gap-8 p-8 md:grid-cols-3 md:p-12">
                    <div className="flex flex-col pl-6" style={{ borderLeft: '4px solid #D4AF37' }}>
                        <span className="text-4xl font-bold leading-none sm:text-5xl md:text-6xl font-mono-custom" style={{ color: '#D4AF37' }}>6</span>
                        <span className="mt-2 text-xs font-medium uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.60)', fontFamily: 'JetBrains Mono, monospace' }}>Premier Leagues</span>
                    </div>
                    <div className="flex flex-col pl-6" style={{ borderLeft: '4px solid #D4AF37' }}>
                        <span className="text-4xl font-bold leading-none sm:text-5xl md:text-6xl font-mono-custom" style={{ color: '#D4AF37' }}>8</span>
                        <span className="mt-2 text-xs font-medium uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.60)', fontFamily: 'JetBrains Mono, monospace' }}>FA Cups</span>
                    </div>
                    <div className="flex flex-col pl-6" style={{ borderLeft: '4px solid #D4AF37' }}>
                        <span className="text-4xl font-bold leading-none sm:text-5xl md:text-6xl font-mono-custom" style={{ color: '#D4AF37' }}>2</span>
                        <span className="mt-2 text-xs font-medium uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.60)', fontFamily: 'JetBrains Mono, monospace' }}>Champions Leagues</span>
                    </div>
                </div>
            </section>

            {/* Features Section (Asymmetric) */}
            <section className="reveal mt-6 space-y-6">
                {/* Row 1: Stadium Tours (2/3) + Chelsea Museum (1/3) */}
                <div className="flex flex-col gap-6 md:flex-row">
                    <div className="gold-glow w-full md:w-2/3 glass-card p-10 transition-all duration-500 group hover:border-l-[4px] hover:border-l-[#D4AF37]">
                        <div className="mb-12 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold md:text-3xl" style={{ color: 'rgba(255,255,255,0.90)' }}>Stadium Tours</h2>
                                <p className="mt-2 max-w-md text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                    Our expert guides take you through the players' tunnel, the dressing rooms, and the pitchside dugout.
                                </p>
                            </div>
                            <svg className="h-10 w-10 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                            </svg>
                        </div>
                        <div className="aspect-video w-full overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            <img alt="Stadium Dressing Room" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src="/stadium-tour.jpg" />
                        </div>
                    </div>

                    <div className="gold-glow w-full md:w-1/3 glass-card flex flex-col p-10 transition-all duration-500 group hover:border-l-[4px] hover:border-l-[#D4AF37]">
                        <div className="mb-8">
                            <svg className="mb-6 h-10 w-10 transition-transform duration-300 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.022 6.022 0 01-2.77-.896m0 0A6.022 6.022 0 017.73 9.728" />
                            </svg>
                            <h2 className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>Chelsea Museum</h2>
                            <p className="mt-2 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                A deep dive into over 100 years of footballing excellence and historic memorabilia.
                            </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <span className="text-xs font-medium uppercase tracking-[0.05em] font-mono-custom" style={{ color: 'rgba(255,255,255,0.70)' }}>View Collection</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.70)" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Row 2 (Reversed): Matchday Experience (2/3) + Trust Metric (1/3) */}
                <div className="flex flex-col gap-6 md:flex-row-reverse">
                    <div className="gold-glow w-full md:w-2/3 glass-card p-10 transition-all duration-500 group hover:border-l-[4px] hover:border-l-[#D4AF37]">
                        <div className="mb-12 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold md:text-3xl" style={{ color: 'rgba(255,255,255,0.90)' }}>Matchday Experience</h2>
                                <p className="mt-2 max-w-md text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                    Upgrade your tour to include legendary player meets and matchday hospitality access.
                                </p>
                            </div>
                            <svg className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        </div>
                        <div className="aspect-[21/9] w-full overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            <img alt="Hospitality Lounge" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src="/hospitality.jpg" />
                        </div>
                    </div>

                    <div className="gold-glow w-full md:w-1/3 glass-card flex flex-col items-center justify-center p-10 text-center transition-all duration-500 group hover:border-l-[4px] hover:border-l-[#D4AF37]">
                        <h3 className="text-5xl font-bold leading-tight md:text-6xl font-mono-custom" style={{ color: '#D4AF37' }}>4.9/5</h3>
                        <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.60)' }}>
                            Rated by over 50,000 visitors yearly as the premier stadium tour experience in London.
                        </p>
                        <div className="mt-6 flex justify-center gap-1">
                            {[1,2,3,4,5].map((star) => (
                                <svg key={star} className="h-5 w-5" fill="#D4AF37" viewBox="0 0 24 24">
                                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="reveal mt-10 text-center">
                <div className="shimmer-sweep glass-card p-12 md:p-20">
                    <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Ready to Walk the Tunnel?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Tickets are limited for matchday weeks. Secure your spot in the history books today.
                    </p>
                    <Link
                        to="/book"
                        className="mt-10 inline-flex items-center gap-2 rounded-full border px-12 py-5 font-semibold transition-all duration-300 hover:scale-105 hover:bg-[rgba(212,175,55,0.1)]"
                        style={{
                            borderColor: 'rgba(212,175,55,0.5)',
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(20px)',
                            color: '#D4AF37'
                        }}
                    >
                        Book Now
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="glass-card mt-6 !rounded-none !border-b-0 !border-x-0 pb-4 pt-6">
                <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center justify-between gap-4 px-8 md:flex-row">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#003399', fontFamily: 'JetBrains Mono, monospace' }}>BridgeTour</span>
                    <div className="flex gap-8">
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.40)' }}>Privacy Policy</span>
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.40)' }}>Terms of Service</span>
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.40)' }}>Contact</span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>&copy; 2026 BridgeTour. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
