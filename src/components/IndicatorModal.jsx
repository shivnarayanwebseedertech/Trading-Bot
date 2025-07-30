import React, { useState } from "react";

function IndicatorModal({ indicators, onToggle, onClose }) {
  const [search, setSearch] = useState("");

  const filteredIndicators = indicators.filter(
    (ind) =>
      ind.label.toLowerCase().includes(search.toLowerCase()) ||
      ind.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-4 text-gray-600 dark:text-gray-300 text-xl hover:text-blue-600"
          aria-label="Close indicators modal"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>

        <input
          type="text"
          placeholder="Search indicators..."
          className="w-full mb-4 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          aria-label="Search indicators"
        />

        {filteredIndicators.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No indicators found
          </p>
        ) : (
          filteredIndicators.map(({ key, label, active }) => (
            <div key={key} className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {label}
              </span>
              <button
                className={`px-3 py-1 rounded ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600"
                }`}
                onClick={() => onToggle(key)}
                type="button"
                aria-pressed={active}
                aria-label={active ? `Remove ${label}` : `Add ${label}`}
              >
                {active ? "Active" : "Add"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default IndicatorModal;
