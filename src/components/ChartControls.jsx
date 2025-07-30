// src/components/ChartControls.jsx
import React, { useState } from "react";
import IndicatorModal from "./IndicatorModal";

const timeframes = ["1m", "5m", "1h", "1d"];

function ChartControls({
  selectedTf,
  setSelectedTf,
  activeIndicators = [], // default to empty array to prevent errors
  setActiveIndicators,
}) {
  const [showIndicators, setShowIndicators] = useState(false);

  // Complete list of available indicators (expand as you wish)
  const allIndicators = [
    { key: "sma", label: "Simple Moving Average" },
    { key: "ema", label: "Exponential Moving Average" },
    { key: "rsi", label: "Relative Strength Index" },
    { key: "macd", label: "MACD" },
    { key: "bbands", label: "Bollinger Bands" },
  ];

  // Toggle indicator on/off
  const toggleIndicator = (key) => {
    const exists = activeIndicators.find((ind) => ind.key === key);
    if (exists) {
      setActiveIndicators(activeIndicators.filter((ind) => ind.key !== key));
    } else {
      const indicator = allIndicators.find((ind) => ind.key === key);
      if (indicator) setActiveIndicators([...activeIndicators, indicator]);
    }
  };

  // Remove indicator from active indicators
  const removeIndicator = (key) => {
    setActiveIndicators(activeIndicators.filter((ind) => ind.key !== key));
  };

  return (
    <div className="mb-4">
      {/* Timeframe selector buttons */}
      <div className="flex items-center gap-2 mb-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            className={`px-3 py-1 rounded ${
              selectedTf === tf
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-600"
            }`}
            onClick={() => setSelectedTf(tf)}
            type="button"
          >
            {tf.toUpperCase()}
          </button>
        ))}

        {/* Indicators Modal toggle button */}
        <button
          className="ml-4 px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
          onClick={() => setShowIndicators(true)}
          type="button"
        >
          Indicators
        </button>
      </div>

      {/* Active indicator badges with remove button */}
      {activeIndicators.length > 0 && (
        <div className="mb-4">
          {activeIndicators.map((i) => (
            <span
              key={i.key}
              className="inline-flex items-center bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded mr-2 mb-1"
            >
              {i.label}
              <button
                className="ml-1 text-lg leading-none hover:text-blue-900"
                aria-label={`Remove ${i.label}`}
                onClick={() => removeIndicator(i.key)}
                type="button"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Indicator selection modal */}
      {showIndicators && (
        <IndicatorModal
          indicators={allIndicators.map((ind) => ({
            ...ind,
            active: activeIndicators.some((a) => a.key === ind.key),
          }))}
          onToggle={toggleIndicator}
          onClose={() => setShowIndicators(false)}
        />
      )}
    </div>
  );
}

export default ChartControls;
