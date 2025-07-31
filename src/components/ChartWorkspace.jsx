import React, { useEffect } from "react";
import { DrawingProvider, useDrawing } from "../context/DrawingContext";
import ChartToolbar from "./ChartToolbar";
import Chart from "./Chart";
import UndoRedoControls from "./UndoRedoControls";

/**
 * UndoRedoWithKeyboard listens for keyboard shortcuts to invoke undo/redo.
 * Placed inside chart workspace.
 */
function UndoRedoWithKeyboard() {
  const { undo, redo, canUndo, canRedo } = useDrawing();

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
      } else if (
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return null; // no UI directly rendered here
}

function ChartWorkspace({
  symbol,
  timeframe,
  drawings,
  setDrawings,
  activeIndicators,
}) {
  return (
    <DrawingProvider drawings={drawings} setDrawings={setDrawings}>
      <div className="flex w-full h-full relative flex-col">
        {/* Undo/Redo Buttons */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
          <UndoRedoControls />
          {/* You can add more toolbar elements here */}
        </div>

        {/* Chart Toolbar */}
        <ChartToolbar />
        {/* Chart Area */}
        <div className="flex-1 pl-16 pr-1 pt-6 relative">
          <Chart
            symbol={symbol}
            timeframe={timeframe}
            activeIndicators={activeIndicators}
          />
        </div>

        {/* Keyboard shortcut listeners */}
        <UndoRedoWithKeyboard />
      </div>
    </DrawingProvider>
  );
}

export default ChartWorkspace;
