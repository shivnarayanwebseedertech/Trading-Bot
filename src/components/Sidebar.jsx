import React, { useState, useEffect, useRef } from "react";

// FMP API setup:
const GAINERS_API =
  "https://financialmodelingprep.com/api/v3/stock_market/gainers";
const SEARCH_API = "https://financialmodelingprep.com/api/v3/search";
const API_KEY = "demo"; // Using demo key directly

// -- Watchlist with mock stock data --
export default function Sidebar({ selectedSymbol, setSelectedSymbol, darkMode }) {
  // Mock stock data for the sidebar
  const mockStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 195.42 },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 420.55 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 175.98 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 183.32 },
    { symbol: "META", name: "Meta Platforms Inc.", price: 472.01 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 177.89 },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 950.02 },
    { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 198.75 },
    { symbol: "V", name: "Visa Inc.", price: 275.63 },
    { symbol: "WMT", name: "Walmart Inc.", price: 59.98 },
    { symbol: "JNJ", name: "Johnson & Johnson", price: 147.55 },
    { symbol: "PG", name: "Procter & Gamble Co.", price: 162.30 },
    { symbol: "MA", name: "Mastercard Inc.", price: 458.12 },
    { symbol: "UNH", name: "UnitedHealth Group Inc.", price: 527.89 },
    { symbol: "HD", name: "Home Depot Inc.", price: 345.67 }
  ];

  const [symbols, setSymbols] = useState(mockStocks.map(stock => stock.symbol));
  const [names, setNames] = useState(mockStocks.reduce((acc, stock) => {
    acc[stock.symbol] = stock.name;
    return acc;
  }, {}));
  const [prices, setPrices] = useState(mockStocks.reduce((acc, stock) => {
    acc[stock.symbol] = stock.price;
    return acc;
  }, {}));
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const searchTimer = useRef(null);
  const dragIdx = useRef(null);

  // Set the first stock as selected if none is selected
  useEffect(() => {
    if (!selectedSymbol && symbols.length > 0) {
      setSelectedSymbol(symbols[0]);
    }
  }, [symbols, selectedSymbol, setSelectedSymbol]);

  // Save to localStorage when changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(symbols));
  }, [symbols]);

  // ========== 2. Mock price updates ==========
  useEffect(() => {
    // Simulate price updates with small random changes
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        symbols.forEach(symbol => {
          if (newPrices[symbol]) {
            // Add a small random change (-0.5% to +0.5%)
            const change = (Math.random() - 0.5) * 0.01;
            newPrices[symbol] = +(newPrices[symbol] * (1 + change)).toFixed(2);
          }
        });
        return newPrices;
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [symbols]);

  // ========== 3. Search/autocomplete with mock data ==========
  useEffect(() => {
    if (!input.trim()) return setSuggestions([]);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    
    searchTimer.current = setTimeout(() => {
      // Filter mock stocks based on input
      const filteredStocks = mockStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(input.toLowerCase()) || 
        stock.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 8); // Limit to 8 results
      
      setSuggestions(filteredStocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        type: 'Common Stock'
      })));
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
    <aside className={`w-56 min-w-40 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-[#121826] border-gray-200'} border-r p-4 flex flex-col`}>
      {/* Search box */}
      <div className="flex mb-2 relative">
        <input
          className={`flex-1 rounded px-2 py-1 border text-sm ${darkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          placeholder="Search or add symbol..."
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
          className={`ml-2 px-2 py-1 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded hover:bg-blue-500 transition-colors`}
          type="button"
          disabled={!input.trim()}
        >
          +
        </button>
        {/* Suggestions */}
        {searchActive && suggestions.length > 0 && (
          <div className={`absolute z-20 left-0 top-8 w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded shadow-xl`}>
            {suggestions.map((s) => (
              <div
                key={s.symbol}
                className={`px-2 py-1 cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-blue-100 text-gray-900'} text-xs`}
                title={s.name}
                onMouseDown={() => addSymbol(s.symbol, s.name)}
              >
                <b>{s.symbol}</b>{" "}
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{s.name}</span>{" "}
                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>({s.type})</span>
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
                  ? `${darkMode ? 'bg-blue-900' : 'bg-blue-50'} border-l-4 border-blue-600 font-bold`
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedSymbol(sym);
              }}
            >
              <span className={`flex-1 truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{sym}</span>
              <span className={`ml-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                {names[sym] || ""}
              </span>
              <span
                className={`ml-2 text-sm tabular-nums ${
                  price == null 
                    ? (darkMode ? "text-gray-500" : "text-gray-400") 
                    : (darkMode ? "text-green-500" : "text-green-600")
                }`}
              >
                {price == null ? "..." : `$${price.toFixed(4)}`}
              </span>
              <button
                className={`ml-2 ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} text-xs`}
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
                className={`ml-1 cursor-move ${darkMode ? 'text-gray-600' : 'text-gray-300'} select-none`}
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
