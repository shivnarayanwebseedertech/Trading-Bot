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

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      // TODO: Replace this mock data fetch with real backend API call

      // Example backend call: fetch(`/api/symbols?q=${encodeURIComponent(query)}`)
      //   .then(res => res.json())
      //   .then(data => setResults(data))
      //   .catch(() => setResults([]));

      // Below is the current mocked universe for demo/testing:
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

  function handleSelect({ symbol }) {
    onSelect(symbol);
    setQuery("");
    setShow(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShow(true)}
        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Symbol search input"
        autoComplete="off"
      />
      {show && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 max-h-60 overflow-auto rounded border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          {results.map(({ symbol, name }) => (
            <li
              key={symbol}
              role="option"
              tabIndex={-1}
              onClick={() => handleSelect({ symbol, name })}
              className="flex cursor-pointer justify-between px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700"
            >
              <span className="font-semibold">{symbol}</span>
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SymbolSearch;
