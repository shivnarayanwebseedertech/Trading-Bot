import React from "react";
import SymbolSearch from "./SymbolSearch";

function TopNav({ onSymbolSelect, location, children }) {
  return (
    <div className="h-14 flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 font-semibold sticky top-0 z-10 shadow-sm">
      <span className="text-blue-700 dark:text-blue-400 text-lg mr-8 tracking-wide font-bold select-none">
        TradingView Clone
      </span>
      <span className="ml-1 mr-8 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-700">
        {location}
      </span>
      <div className="w-72 mr-6">
        <SymbolSearch onSelect={onSymbolSelect} />
      </div>
      <div className="ml-auto flex items-center gap-6">
        {children}
        <button className="rounded-md px-4 py-1 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 font-medium hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors">
          Login
        </button>
      </div>
    </div>
  );
}

export default TopNav;
