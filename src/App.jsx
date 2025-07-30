import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import ChartControls from "./components/ChartControls";
import ThemeToggle from "./components/ThemeToggle";
import ChartWorkspace from "./components/ChartWorkspace"; // Adjust path as needed

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1h");
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize darkMode from localStorage or system preference fallback
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // State to manage selected technical indicators (shown on chart)
  const [activeIndicators, setActiveIndicators] = useState([]);

  useEffect(() => {
    // Apply or remove dark class on root element
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top navigation with location and toggle */}
      <TopNav onSymbolSelect={setSelectedSymbol} location="India">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </TopNav>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with watchlist */}
        <Sidebar
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />
        {/* Chart controls and workspace */}
        <main className="flex-1 p-6 overflow-auto">
          <ChartControls
            selectedTf={timeframe}
            setSelectedTf={setTimeframe}
            activeIndicators={activeIndicators}
            setActiveIndicators={setActiveIndicators}
          />
          <ChartWorkspace
            symbol={selectedSymbol}
            timeframe={timeframe}
            activeIndicators={activeIndicators}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
