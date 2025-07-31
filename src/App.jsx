import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./utils/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import ChartControls from "./components/ChartControls";
import ThemeToggle from "./components/ThemeToggle";
import ChartWorkspace from "./components/ChartWorkspace";
import TradeActions from "./components/TradeActions";
import WorkspaceTabs from "./components/WorkspaceTabs";
import BottomPanel from "./components/BottomPanel";
import AlertPanel from "./components/AlertPanel";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationPanel from "./components/NotificationPanel";

function defaultWorkspace(symbol = "AAPL") {
  return {
    id: Date.now() + Math.random(),
    symbol,
    label: symbol,
    timeframe: "1h",
    drawings: [], // Per-workspace drawings
    activeIndicators: [],
    chartData: [], // Expected array of price bars for the symbol
    indicatorsData: [], // Expected array of indicator data per bar (RSI, MACD, etc)
  };
}

function App() {
  // Workspaces and active tab state
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem("workspaces");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore parse errors and fallback
      }
    }
    return [defaultWorkspace()];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const ws = workspaces[activeIdx];

  // Dark mode state, synced with system and localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Persist workspaces to localStorage on change (for guests or before auth sync)
  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  // Auth user from context
  const { user } = useAuth();

  // Alerts state: listen to Firestore for current user's alerts for current workspace symbol
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!user || !ws?.symbol) {
      setAlerts([]);
      return;
    }
    const alertsCollection = collection(db, "users", user.uid, "alerts");
    const unsubscribe = onSnapshot(alertsCollection, (snapshot) => {
      const allAlerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Filter only alerts for current symbol
      const filteredAlerts = allAlerts.filter((a) => a.symbol === ws.symbol);
      setAlerts(filteredAlerts);
    });
    return () => unsubscribe();
  }, [user, ws?.symbol]);

  // Workspace manipulation functions
  function addTab() {
    setWorkspaces((prev) => {
      const newWs = defaultWorkspace("AAPL");
      return [...prev, newWs];
    });
    setActiveIdx(workspaces.length);
  }

  function closeTab(idx) {
    if (workspaces.length === 1) return; // Prevent deleting last workspace
    setWorkspaces((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(idx === 0 ? 0 : idx - 1);
  }

  function renameTab(idx, label) {
    setWorkspaces((prev) =>
      prev.map((ws, i) => (i === idx ? { ...ws, label } : ws))
    );
  }

  // Add handlers to perform your logic:
  function handleBuy() {
    alert("Buy action simulated! (Hook this up to your order logic.)");
  }
  function handleSell() {
    alert("Sell action simulated! (Hook this up to your order logic.)");
  }
  function handleStrategy() {
    alert(
      "Strategy applied! (Insert your auto-trading or backtest logic here.)"
    );
  }

  function updateWorkspaceField(field, value) {
    setWorkspaces((prev) =>
      prev.map((ws, i) => (i === activeIdx ? { ...ws, [field]: value } : ws))
    );
  }

  // Export current workspace to JSON file
  function exportWorkspace(ws) {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(ws));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      const filename = ws.label
        ? ws.label.replace(/\s+/g, "_")
        : ws.symbol || "workspace";
      a.setAttribute("download", `tradingview-clone-${filename}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to export workspace");
    }
  }

  // Import workspace from JSON file
  function importWorkspace(setWorkspaces, setActiveIdx) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const ws = JSON.parse(evt.target.result);
          if (!ws.symbol || !ws.timeframe) {
            alert("Invalid workspace file: missing symbol or timeframe");
            return;
          }
          setWorkspaces((prev) => [...prev, ws]);
          setActiveIdx((prev) => prev.length); // Switch to new tab
        } catch (error) {
          alert("Failed to parse workspace file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <NotificationProvider>
      <NotificationPanel />
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <TopNav location="India">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </TopNav>

        {/* Workspace Tabs with export/import handlers */}
        <WorkspaceTabs
          workspaces={workspaces}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          addTab={addTab}
          closeTab={closeTab}
          renameTab={renameTab}
          exportWorkspace={exportWorkspace}
          importWorkspace={() => importWorkspace(setWorkspaces, setActiveIdx)}
          setWorkspaces={setWorkspaces}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Symbol selection sidebar */}
          <Sidebar
            selectedSymbol={ws.symbol}
            setSelectedSymbol={(symbol) =>
              updateWorkspaceField("symbol", symbol)
            }
          />

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto flex flex-col">
            <ChartControls
              selectedTf={ws.timeframe}
              setSelectedTf={(tf) => updateWorkspaceField("timeframe", tf)}
              activeIndicators={ws.activeIndicators}
              setActiveIndicators={(inds) =>
                updateWorkspaceField("activeIndicators", inds)
              }
            />
            <ChartWorkspace
              symbol={ws.symbol}
              timeframe={ws.timeframe}
              activeIndicators={ws.activeIndicators}
              drawings={ws.drawings}
              setDrawings={(drawings) =>
                updateWorkspaceField("drawings", drawings)
              }
              alerts={alerts.filter((a) => a.symbol === ws.symbol && a.active)}
              chartData={ws.chartData || []}
              indicatorsData={ws.indicatorsData || []}
            />
            <TradeActions symbol={ws.symbol} />
            <AlertPanel
              symbol={ws.symbol}
              chartData={ws.chartData || []}
              indicatorsData={ws.indicatorsData || []}
            />
            <BottomPanel symbol={ws.symbol} />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
