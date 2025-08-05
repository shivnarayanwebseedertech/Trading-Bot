import React, { useEffect } from "react";
import { DrawingProvider, useDrawing } from "../context/DrawingContext";
import ChartToolbar from "./ChartToolbar";
import Chart from "./Chart";

/**
 * This component listens for keyboard shortcuts to invoke undo/redo.
 * Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z / Cmd/Ctrl+Y.
 */

function ChartWorkspace({
  symbol,
  timeframe,
  drawings,
  setDrawings,
  activeIndicators,
  // Optionally add alerts={...} or chartData={...} props if needed
}) {
  return (
    <DrawingProvider drawings={drawings} setDrawings={setDrawings}>
      <div className="flex w-full h-full relative flex-col">
        {/* Undo/Redo Buttons Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
          {/* Add other custom controls here if necessary */}
        </div>

        {/* Persistent Drawing/Chart Toolbar */}
        <ChartToolbar />

        {/* Main Chart Area */}
        <div className="flex-1 pl-16 pr-1 pt-6 relative">
          <Chart
            symbol={symbol}
            timeframe={timeframe}
            activeIndicators={activeIndicators}
            // Pass chartData, alerts, or extra props here if needed in future
          />
        </div>

        {/* Enable Undo/Redo via Keyboard */}
      </div>
    </DrawingProvider>
  );
}

export default ChartWorkspace;
