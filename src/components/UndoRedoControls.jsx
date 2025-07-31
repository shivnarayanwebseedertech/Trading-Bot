import React from "react";
import { useDrawing } from "../context/DrawingContext";

export default function UndoRedoControls() {
  const { undo, redo, canUndo, canRedo } = useDrawing();

  return (
    <div className="flex space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded shadow-md w-max">
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`px-3 py-1 rounded border ${
          canUndo
            ? "hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`px-3 py-1 rounded border ${
          canRedo
            ? "hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        Redo
      </button>
    </div>
  );
}
