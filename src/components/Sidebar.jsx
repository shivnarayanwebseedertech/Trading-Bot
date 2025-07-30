import React, { useState, useEffect } from "react";
import WatchlistItem from "./WatchlistItem";
import SymbolSearch from "./SymbolSearch";

function Sidebar({ selectedSymbol, setSelectedSymbol }) {
  const [watchlist, setWatchlist] = useState(
    () => JSON.parse(localStorage.getItem("watchlist")) || ["AAPL", "BTCUSD"]
  );

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAddSymbol = (symbol) => {
    if (!watchlist.includes(symbol)) setWatchlist([symbol, ...watchlist]);
  };

  const handleRemove = (symbol) => {
    const newList = watchlist.filter((s) => s !== symbol);
    setWatchlist(newList);
    if (symbol === selectedSymbol) {
      setSelectedSymbol(newList[0] || null);
    }
  };

  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-800 flex flex-col">
      <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
        <SymbolSearch onSelect={handleAddSymbol} placeholder="Add symbol..." />
      </div>
      <div className="overflow-auto flex-1">
        {watchlist.length === 0 ? (
          <div className="p-4 text-gray-500 dark:text-gray-400">
            Watchlist empty. Add symbols above.
          </div>
        ) : (
          watchlist.map((symbol) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              selected={selectedSymbol === symbol}
              onClick={() => setSelectedSymbol(symbol)}
              onRemove={() => handleRemove(symbol)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
