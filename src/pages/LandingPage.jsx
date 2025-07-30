import React from "react";
import { Link } from "react-router-dom"; // If using React Router

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-200 flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-blue-700 tracking-tight">
          ChartPro
        </div>
        <nav>
          <Link
            to="/login"
            className="text-blue-700 px-4 py-2 rounded hover:bg-blue-50 font-semibold"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded ml-2 shadow hover:bg-blue-700 font-semibold"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
          Professional Charting for Traders & Investors
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 max-w-2xl mb-8">
          Experience blazing-fast charts, advanced drawing tools, real-time
          data, customizable workspaces, and all the indicators you love —{" "}
          <span className="font-bold text-blue-600">for free</span>.
        </p>
        <Link
          to="/app"
          className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow hover:bg-blue-900 transition"
        >
          Launch Chart App
        </Link>
        <div className="mt-10 grid gap-8 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
          <Feature
            icon="💹"
            title="Advanced Charts"
            description="Candlesticks, lines, and all your favorite timeframes with TradingView-grade performance."
          />
          <Feature
            icon="🛠️"
            title="Drawing Tools"
            description="Trendlines, shapes, fib retracements – draw, edit, and annotate live on your charts."
          />
          <Feature
            icon="🔔"
            title="Indicators & Alerts"
            description="SMA/EMA, RSI, Bollinger Bands, customizable overlays and soon price/indicator alerts."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-4 text-center text-gray-500 bg-white">
        &copy; {new Date().getFullYear()} ChartPro. Not affiliated with
        TradingView.
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex flex-col items-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-semibold text-lg mb-2">{title}</div>
      <div className="text-gray-600">{description}</div>
    </div>
  );
}

export default LandingPage;
