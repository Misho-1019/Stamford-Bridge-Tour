import AnalyticsPage from "./pages/admin/AnalyticsPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
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
