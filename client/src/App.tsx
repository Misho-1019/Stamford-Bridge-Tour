import AnalyticsPage from './pages/admin/AnalyticsPage';
import bg from "./assets/609888-stamford-bridge-wallpaper.jpg";

function App() {
  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Overlay (important for readability) */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 px-6 py-10">
        <h1 className="text-3xl font-bold text-[#003399]">
          BridgeTour Admin
        </h1>

        <div className="mt-8">
          <AnalyticsPage />
        </div>
      </div>
    </div>
  );
}

export default App
