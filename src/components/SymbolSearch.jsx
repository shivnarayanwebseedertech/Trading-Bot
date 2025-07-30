import React, { useState, useEffect, useRef } from "react";

function SymbolSearch({ onSelect, placeholder = "Search symbol..." }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock symbol search API (replace with your backend)
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    // Simulate API call with delay
    const timer = setTimeout(() => {
      const mockUniverse = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "TSLA", name: "Tesla Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "BTCUSD", name: "Bitcoin" },
        { symbol: "ETHUSD", name: "Ethereum" },
        { symbol: "NIFTY", name: "Nifty 50" },
      ];
      const filtered = mockUniverse.filter(
        (s) =>
          s.symbol.toLowerCase().startsWith(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setShow(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(sym) {
    onSelect(sym.symbol);
    setQuery("");
    setShow(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShow(true)}
        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {show && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow mt-1 max-h-60 overflow-auto z-20">
          {results.map((s) => (
            <li
              key={s.symbol}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 flex justify-between"
              onClick={() => handleSelect(s)}
            >
              <span className="font-semibold">{s.symbol}</span>
              <span className="text-gray-500 dark:text-gray-400">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SymbolSearch;
