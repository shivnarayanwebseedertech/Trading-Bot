import React, { useState, useEffect, useRef } from "react";

// FMP API setup:
const GAINERS_API =
  "https://financialmodelingprep.com/api/v3/stock_market/gainers";
const SEARCH_API = "https://financialmodelingprep.com/api/v3/search";
const API_KEY = import.meta.env.VITE_COMPANY_API_KEY || "demo";

// -- Watchlist pulls top gainers by default! --
export default function Sidebar({ selectedSymbol, setSelectedSymbol }) {
  const [symbols, setSymbols] = useState([]);
  const [names, setNames] = useState({}); // symbol -> full name
  const [prices, setPrices] = useState({});
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const searchTimer = useRef(null);
  const dragIdx = useRef(null);

  // ========== 1. At load, fetch top global gainers as default watchlist ==========
  useEffect(() => {
    const ls = localStorage.getItem("watchlist");
    if (ls) {
      setSymbols(JSON.parse(ls));
      return;
    }
    // Else, fetch FMP top gainers
    fetch(`${GAINERS_API}?apikey=${API_KEY}`)
      .then((res) => res.json())
      .then((list) => {
        if (!Array.isArray(list)) list = [];
        setSymbols(list.map((row) => row.symbol));
        setNames(
          list.reduce((o, row) => {
            o[row.symbol] = row.name;
            return o;
          }, {})
        );
        // Pick first as selected if not set (needs parent prop default!)
        if (list.length && !selectedSymbol) setSelectedSymbol(list[0].symbol);
      })
      .catch(() => setSymbols(["AAPL"]));
    // eslint-disable-next-line
  }, []);
  // Save to localStorage when changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(symbols));
  }, [symbols]);

  // ========== 2. Price fetching ==========
  useEffect(() => {
    // Could switch to your chart API for uniformity if needed
    let ignore = false;
    async function refreshPrices() {
      const promises = symbols.map((sym) =>
        fetch(
          `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
            sym.replace("/", "")
          )}&apikey=demo`
        )
          .then((r) => r.json())
          .then((d) => ({ price: +d.price || null, symbol: sym }))
          .catch(() => ({ price: null, symbol: sym }))
      );
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

  // ========== 3. Search/autocomplete with FMP ==========
  useEffect(() => {
    if (!input.trim()) return setSuggestions([]);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetch(
        `${SEARCH_API}?query=${encodeURIComponent(
          input.trim()
        )}&limit=8&apikey=${API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions(data || []))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [input]);

  // ========== 4. Add, remove, drag ==========
  function addSymbol(sym, name) {
    if (!symbols.includes(sym)) setSymbols([...symbols, sym]);
    if (name) setNames((n) => ({ ...n, [sym]: name }));
    setSelectedSymbol(sym);
    setInput("");
    setSuggestions([]);
    setSearchActive(false);
  }
  function removeSymbol(sym) {
    setSymbols(symbols.filter((s) => s !== sym));
    if (sym === selectedSymbol) setSelectedSymbol(symbols[0] || "");
  }
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

  // ========== 5. UI ==========
  return (
    <aside className="w-56 min-w-40 bg-[#121826] dark:bg-gray-900 border-r dark:border-gray-700 p-4 flex flex-col">
      {/* Search box */}
      <div className="flex mb-2 relative">
        <input
          className="flex-1 rounded px-2 py-1 border text-sm"
          placeholder="Add symbol/company"
          value={input}
          onFocus={() => setSearchActive(true)}
          onBlur={() => setTimeout(() => setSearchActive(false), 150)}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setSearchActive(true);
          }}
          aria-label="Search global stocks"
        />
        <button
          onClick={() =>
            suggestions[0]?.symbol &&
            addSymbol(suggestions[0].symbol, suggestions[0].name)
          }
          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
          type="button"
          disabled={!input.trim()}
        >
          +
        </button>
        {/* Suggestions */}
        {searchActive && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 top-8 w-full bg-white border border-gray-200 rounded shadow-xl">
            {suggestions.map((s) => (
              <div
                key={s.symbol}
                className="px-2 py-1 cursor-pointer hover:bg-blue-100 text-xs"
                title={s.name}
                onMouseDown={() => addSymbol(s.symbol, s.name)}
              >
                <b>{s.symbol}</b>{" "}
                <span className="text-gray-600">{s.name}</span>{" "}
                <span className="text-gray-400">({s.exchangeShortName})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Watchlist (always starts with top gainers) */}
      <ul className="flex-1 overflow-auto space-y-1" aria-label="Watchlist">
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
              className={`rounded flex items-center px-2 py-1 cursor-pointer transition ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 font-bold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedSymbol(sym);
              }}
            >
              <span className="flex-1 truncate">{sym}</span>
              <span className="ml-2 text-xs text-gray-400 truncate">
                {names[sym] || ""}
              </span>
              <span
                className={`ml-2 text-sm tabular-nums ${
                  price == null ? "text-gray-400" : "text-green-600"
                }`}
              >
                {price == null ? "..." : `$${price.toFixed(4)}`}
              </span>
              <button
                className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(sym);
                }}
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
