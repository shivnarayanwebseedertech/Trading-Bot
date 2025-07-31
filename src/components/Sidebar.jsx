import React, { useState, useEffect, useRef } from "react";

// Example default watchlist; let users customize/add
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];

function fetchPrice(symbol) {
  // Example polling with free API (Financial Modeling Prep, demo key, 15min delay)
  return fetch(
    `https://financialmodelingprep.com/api/v3/quote-short/${symbol}?apikey=demo`
  )
    .then((res) => res.json())
    .then((data) =>
      data && data[0]
        ? { price: +data[0].price, symbol }
        : { price: null, symbol }
    )
    .catch(() => ({ price: null, symbol }));
}

export default function Sidebar({ selectedSymbol, setSelectedSymbol }) {
  const [symbols, setSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem("watchlist");
      return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
    } catch {
      return DEFAULT_SYMBOLS;
    }
  });
  const [prices, setPrices] = useState({});
  const [input, setInput] = useState("");

  // POLLING: Refresh prices every N seconds
  useEffect(() => {
    let ignore = false;
    async function refresh() {
      const promises = symbols.map((sym) => fetchPrice(sym));
      const results = await Promise.all(promises);
      if (!ignore)
        setPrices((prev) =>
          results.reduce(
            (acc, { price, symbol }) => ({
              ...acc,
              [symbol]: price,
            }),
            { ...prev }
          )
        );
    }
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [symbols]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(symbols));
  }, [symbols]);

  // DRAG-AND-DROP (Simple vanilla)
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

  // Add new symbol
  function addSymbol() {
    const sym = input.trim().toUpperCase();
    if (sym && !symbols.includes(sym)) {
      setSymbols([...symbols, sym]);
      setInput("");
    }
  }
  // Remove symbol
  function removeSymbol(sym) {
    setSymbols(symbols.filter((s) => s !== sym));
  }

  return (
    <aside className="w-56 min-w-40 bg-white dark:bg-gray-900 border-r dark:border-gray-700 p-4 flex flex-col">
      <div className="flex mb-2">
        <input
          className="flex-1 rounded px-2 py-1 border text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSymbol()}
          placeholder="Add symbol"
        />
        <button
          onClick={addSymbol}
          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
        >
          +
        </button>
      </div>
      <ul className="flex-1 overflow-auto space-y-1" style={{ minHeight: 0 }}>
        {symbols.map((sym, i) => {
          const price = prices[sym];
          const isActive = sym === selectedSymbol;
          return (
            <li
              key={sym}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={() => handleDrop(i)}
              className={`
                rounded flex items-center px-2 py-1 cursor-pointer select-none
                transition
                ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 font-bold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
              onClick={() => setSelectedSymbol(sym)}
            >
              <span className="flex-1 truncate">{sym}</span>
              <span
                className={`ml-2 text-sm tabular-nums ${
                  price === null ? "text-gray-400" : "text-green-600"
                }`}
              >
                {price === null ? "..." : `$${price.toFixed(2)}`}
              </span>
              <button
                className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(sym);
                }}
                aria-label={`Remove ${sym}`}
                tabIndex={-1}
              >
                ×
              </button>
              <span className="ml-1 cursor-move text-gray-300">⋮</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
