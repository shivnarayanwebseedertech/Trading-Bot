import React, { useState, useEffect, useRef } from "react";

// Default watchlist symbols; can be replaced or extended later via backend
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];

// Fetch current price for the symbol from an API (dummy/demo URL here)
// Replace with your own backend or real-time feed service when ready
function fetchPrice(symbol) {
  return fetch(
    `https://financialmodelingprep.com/api/v3/quote-short/${encodeURIComponent(
      symbol
    )}?apikey=demo`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch price");
      return res.json();
    })
    .then((data) =>
      data && data[0]
        ? { price: +data[0].price, symbol }
        : { price: null, symbol }
    )
    .catch(() => ({ price: null, symbol }));
}

export default function Sidebar({ selectedSymbol, setSelectedSymbol }) {
  // Watchlist state persists in localStorage
  const [symbols, setSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem("watchlist");
      return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
    } catch {
      return DEFAULT_SYMBOLS;
    }
  });

  // Store prices in a symbol->price dictionary
  const [prices, setPrices] = useState({});

  // Controlled input for adding symbols
  const [input, setInput] = useState("");

  // Poll prices every 15 seconds (debounced, cleanup on change/unmount)
  useEffect(() => {
    let ignore = false;

    async function refreshPrices() {
      const promises = symbols.map((sym) => fetchPrice(sym));
      const results = await Promise.all(promises);
      if (!ignore) {
        setPrices((prev) =>
          results.reduce(
            (acc, { price, symbol }) => {
              acc[symbol] = price;
              return acc;
            },
            { ...prev }
          )
        );
      }
    }

    refreshPrices();
    const interval = setInterval(refreshPrices, 15000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [symbols]);

  // Save watchlist symbols in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(symbols));
  }, [symbols]);

  // Drag-and-drop helper state
  const dragIdx = useRef(null);

  function handleDragStart(i) {
    dragIdx.current = i;
  }
  function handleDrop(i) {
    if (dragIdx.current === null || dragIdx.current === i) return;
    const updated = [...symbols];
    const [removed] = updated.splice(dragIdx.current, 1);
    updated.splice(i, 0, removed);
    setSymbols(updated);
    dragIdx.current = null;
  }

  // Validate symbol format (simple: uppercase letters, numbers; improve for your needs)
  function isValidSymbol(sym) {
    return /^[A-Z0-9.]{1,8}$/.test(sym);
  }

  // Add new symbol to watchlist if valid and not existing
  function addSymbol() {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (!isValidSymbol(sym)) {
      alert("Invalid symbol format. Please enter a valid stock symbol.");
      return;
    }
    if (!symbols.includes(sym)) {
      setSymbols([...symbols, sym]);
      setInput("");
      setSelectedSymbol(sym); // Optionally switch to new symbol automatically
    } else {
      alert("Symbol already in watchlist.");
    }
  }

  // Remove symbol from watchlist
  function removeSymbol(sym) {
    setSymbols(symbols.filter((s) => s !== sym));
    // If removed symbol was selected, reset selection to first or empty
    if (sym === selectedSymbol) {
      setSelectedSymbol(symbols.length > 1 ? symbols[0] : "");
    }
  }

  return (
    <aside className="w-56 min-w-40 bg-white dark:bg-gray-900 border-r dark:border-gray-700 p-4 flex flex-col">
      <div className="flex mb-2">
        <input
          className="flex-1 rounded px-2 py-1 border text-sm"
          placeholder="Add symbol"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && addSymbol()}
          aria-label="Add stock symbol"
        />
        <button
          onClick={addSymbol}
          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded focus:outline-none"
          aria-label="Add symbol to watchlist"
          type="button"
        >
          +
        </button>
      </div>

      <ul
        className="flex-1 overflow-auto space-y-1"
        style={{ minHeight: 0 }}
        aria-label="Watchlist"
      >
        {symbols.map((sym, i) => {
          const price = prices[sym];
          const isActive = sym === selectedSymbol;
          return (
            <li
              key={sym}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onClick={() => setSelectedSymbol(sym)}
              className={`rounded flex items-center px-2 py-1 cursor-pointer select-none transition ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 font-bold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedSymbol(sym);
                }
              }}
            >
              <span className="flex-1 truncate">{sym}</span>
              <span
                className={`ml-2 text-sm tabular-nums ${
                  price === null ? "text-gray-400" : "text-green-600"
                }`}
                aria-label={`Price for ${sym}`}
              >
                {price === null ? "..." : `$${price.toFixed(2)}`}
              </span>
              <button
                className="ml-2 text-gray-400 hover:text-red-500 text-xs focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(sym);
                }}
                aria-label={`Remove ${sym} from watchlist`}
                tabIndex={-1}
                type="button"
              >
                ×
              </button>
              <span
                className="ml-1 cursor-move text-gray-300 select-none"
                aria-hidden="true"
                title="Drag to reorder"
              >
                ⋮
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
