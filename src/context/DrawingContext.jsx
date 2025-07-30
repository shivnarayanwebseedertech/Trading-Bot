import React, { createContext, useContext, useState } from "react";

const DrawingContext = createContext();

export function useDrawing() {
  return useContext(DrawingContext);
}

export function DrawingProvider({ children }) {
  const [activeTool, setActiveTool] = useState("select");
  const [drawings, setDrawings] = useState([]);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editAnchor, setEditAnchor] = useState(null); // e.g. { type: 'move' | 'resize', point: 1|2|... }

  const addDrawing = (drawing) => {
    setDrawings((ds) => [...ds, drawing]);
    setSelectedId(null);
  };

  const removeDrawing = (idx) => {
    setDrawings((ds) => ds.filter((_, i) => i !== idx));
    setSelectedId(null);
  };

  const updateDrawing = (idx, newDrawing) => {
    setDrawings((ds) => ds.map((d, i) => (i === idx ? newDrawing : d)));
  };

  const clearDraft = () => setDraft(null);
  const clearDrawings = () => {
    setDrawings([]);
    setSelectedId(null);
  };

  return (
    <DrawingContext.Provider
      value={{
        activeTool,
        setActiveTool,
        drawings,
        setDrawings,
        addDrawing,
        removeDrawing,
        clearDrawings,
        draft,
        setDraft,
        clearDraft,
        selectedId,
        setSelectedId,
        updateDrawing,
        editAnchor,
        setEditAnchor,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
}
