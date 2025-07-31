import React from "react";
import { useDrawing } from "../context/DrawingContext";

function Icon({ name, active }) {
  if (name === "trendline")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <line
          x1="6"
          y1="22"
          x2="22"
          y2="6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  if (name === "rectangle")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <rect
          x="6"
          y="6"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  if (name === "hline")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <line
          x1="6"
          y1="14"
          x2="22"
          y2="14"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  if (name === "text")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <text x="8" y="20" fontSize="14" fontWeight="bold" fill="currentColor">
          T
        </text>
      </svg>
    );
  if (name === "arrow")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <line
          x1="7"
          y1="21"
          x2="21"
          y2="7"
          stroke="currentColor"
          strokeWidth="3"
        />
        <polygon points="18,7 21,7 21,10" fill="currentColor" />
      </svg>
    );
  if (name === "fib")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <rect x="7" y="14" width="14" height="2" fill="currentColor" />
        <rect
          x="7"
          y="18"
          width="14"
          height="2"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="7"
          y="22"
          width="14"
          height="2"
          fill="currentColor"
          opacity="0.25"
        />
      </svg>
    );
  if (name === "select")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-blue-600" : "text-gray-400"}
      >
        <polygon
          points="6,4 22,14 15,16 18,22 14,20 11,16 6,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  if (name === "erase")
    return (
      <svg
        viewBox="0 0 28 28"
        width="22"
        height="22"
        className={active ? "text-red-600" : "text-gray-400"}
      >
        <rect x="7" y="16" width="14" height="4" rx="1.5" fill="currentColor" />
        <rect x="5" y="12" width="10" height="4" rx="1.5" fill="currentColor" />
      </svg>
    );
  return null;
}

const tools = [
  { key: "select", tip: "Select" },
  { key: "trendline", tip: "Trend Line" },
  { key: "rectangle", tip: "Rectangle" },
  { key: "hline", tip: "Horizontal Line" },
  { key: "text", tip: "Text" },
  { key: "arrow", tip: "Arrow" },
  { key: "fib", tip: "Fibonacci Retracement" },
  { key: "erase", tip: "Erase All" },
];

export default function ChartToolbar() {
  const { activeTool, setActiveTool, clearDrawings } = useDrawing();

  return (
    <div
      className="
        absolute left-3 top-12 z-30 flex flex-col gap-2
        bg-white/95 dark:bg-gray-700/95 shadow-lg border border-gray-200 dark:border-gray-600
        rounded-2xl py-4 px-2
      "
    >
      {tools.map((t) =>
        t.key === "erase" ? (
          <button
            key={t.key}
            className="mx-auto p-0.5 mt-3 rounded hover:bg-red-50 transition"
            title={t.tip}
            onClick={clearDrawings}
            type="button"
          >
            <Icon name={t.key} active={false} />
          </button>
        ) : (
          <button
            key={t.key}
            className={`mx-auto p-1 rounded-xl mb-1 w-9 h-9 flex items-center justify-center ${
              activeTool === t.key
                ? "bg-blue-50 dark:bg-blue-900 shadow-inner"
                : "hover:bg-blue-50 dark:hover:bg-gray-800"
            } transition`}
            onClick={() => setActiveTool(t.key)}
            title={t.tip}
            type="button"
          >
            <Icon name={t.key} active={activeTool === t.key} />
          </button>
        )
      )}
    </div>
  );
}

// Integrate with context/workspace for auto-save. 
// To add manual backend save, place "Save" button here and call backend API.
