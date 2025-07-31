import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DrawingContext = createContext();

export function useDrawing() {
  return useContext(DrawingContext);
}

/**
 * DrawingProvider now supports Undo/Redo.
 * It maintains internal undo/redo stacks and synchronizes drawings with parent workspace.
 */
export function DrawingProvider({ children, drawings: initialDrawings = [], setDrawings }) {
  const [activeTool, setActiveTool] = useState("select");
  const [drawings, _setDrawings] = useState(initialDrawings);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editAnchor, setEditAnchor] = useState(null);

  // Sync drawings to parent setter (workspace)
  useEffect(() => {
    if (setDrawings) setDrawings(drawings);
  }, [drawings, setDrawings]);

  // Reset local drawings and clear history on workspace change
  useEffect(() => {
    _setDrawings(initialDrawings);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedId(null);
  }, [initialDrawings]);

  // Helper: call before every drawings update (push current state to undo stack, clear redo)
  const pushUndoStack = useCallback(() => {
    setUndoStack((stack) => [...stack, drawings]);
    setRedoStack([]); // clear redo history on new action
  }, [drawings]);

  // Functions to modify drawings, wrapped to track history

  const addDrawing = (drawing) => {
    pushUndoStack();
    _setDrawings((ds) => [...ds, drawing]);
    setSelectedId(null);
  };

  const removeDrawing = (idx) => {
    pushUndoStack();
    _setDrawings((ds) => ds.filter((_, i) => i !== idx));
    setSelectedId(null);
  };

  const updateDrawing = (idx, newDrawing) => {
    pushUndoStack();
    _setDrawings((ds) => ds.map((d, i) => (i === idx ? newDrawing : d)));
  };

  const clearDrawings = () => {
    if (drawings.length > 0) {
      pushUndoStack();
      _setDrawings([]);
      setSelectedId(null);
    }
  };

  // Undo function: revert to last drawings state
  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, stack.length - 1));
    setRedoStack((stack) => [...stack, drawings]);
    _setDrawings(previous);
    setSelectedId(null);
  };

  // Redo function: re-apply the redo drawings state
  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, stack.length - 1));
    setUndoStack((stack) => [...stack, drawings]);
    _setDrawings(next);
    setSelectedId(null);
  };

  return (
    <DrawingContext.Provider
      value={{
        activeTool,
        setActiveTool,
        drawings,
        setDrawings: _setDrawings,
        addDrawing,
        removeDrawing,
        clearDrawings,
        draft,
        setDraft,
        clearDraft: () => setDraft(null),
        selectedId,
        setSelectedId,
        updateDrawing,
        editAnchor,
        setEditAnchor,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
}
