import { useState } from 'react';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import BookingsPage from './pages/admin/BookingPage';
import bg from './assets/609888-stamford-bridge-wallpaper.jpg';

type AdminView = 'analytics' | 'bookings';

export default function App() {
  const [view, setView] = useState<AdminView>('analytics');

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />

      <div className="relative z-10 px-6 py-10">
        <h1 className="text-3xl font-bold text-[#003399]">
          BridgeTour Admin
        </h1>

        <div className="mt-8 flex w-fit rounded-lg border border-slate-200/50 bg-white/60 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => setView('analytics')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
              view === 'analytics'
                ? 'bg-[#003399] text-white shadow hover:bg-[#002266]'
                : 'text-slate-700 hover:bg-white/60 hover:text-[#003399]'
            }`}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => setView('bookings')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
              view === 'bookings'
                ? 'bg-[#003399] text-white shadow hover:bg-[#002266]'
                : 'text-slate-700 hover:bg-white/60 hover:text-[#003399]'
            }`}
          >
            Bookings
          </button>
        </div>

        <div className="mt-8">
          {view === 'analytics' && <AnalyticsPage />}
          {view === 'bookings' && <BookingsPage />}
        </div>
      </div>
    </div>
  );
}