import React, { useState } from "react";
import IndicatorModal from "./IndicatorModal";

// TODO: Replace below with backend-driven config if making dynamic in the future
const timeframes = ["1m", "5m", "1h", "1d"];

function ChartControls({
  selectedTf,
  setSelectedTf,
  activeIndicators = [],
  setActiveIndicators,
  // Optionally pass timeframes or indicator config from props/context in future
}) {
  const [showIndicators, setShowIndicators] = useState(false);

  // TODO: Replace with backend API fetch or user-configured list in the future
  const allIndicators = [
    { key: "sma", label: "Simple Moving Average" },
    { key: "ema", label: "Exponential Moving Average" },
    { key: "rsi", label: "Relative Strength Index" },
    { key: "macd", label: "MACD" },
    { key: "bbands", label: "Bollinger Bands" },
  ];

  const toggleIndicator = (key) => {
    const exists = activeIndicators.find((ind) => ind.key === key);
    if (exists) {
      setActiveIndicators(activeIndicators.filter((ind) => ind.key !== key));
    } else {
      const indicator = allIndicators.find((ind) => ind.key === key);
      if (indicator) setActiveIndicators([...activeIndicators, indicator]);
      // TODO: Optionally send addIndicator API call here
    }
    // TODO: Optionally sync indicator selection to backend/user profile here
  };

  const removeIndicator = (key) => {
    setActiveIndicators(activeIndicators.filter((ind) => ind.key !== key));
    // TODO: Optionally send removeIndicator API call here
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

      {/* Active indicator badges with remove buttons */}
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
