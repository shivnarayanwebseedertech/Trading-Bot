import React from "react";

function WatchlistItem({ symbol, selected, onClick, onRemove }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`flex items-center justify-between px-4 py-2 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        selected ? "bg-blue-100 dark:bg-blue-800 font-bold" : ""
      }`}
      onClick={onClick}
    >
      <span>{symbol}</span>
      <button
        className="ml-3 text-red-400 hover:text-red-600 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove"
        aria-label={`Remove ${symbol} from watchlist`}
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

export default React.memo(WatchlistItem);
