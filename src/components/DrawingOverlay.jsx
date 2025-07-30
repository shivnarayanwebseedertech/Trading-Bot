import React, { useRef } from "react";
import { useDrawing } from "../context/DrawingContext";

export default function DrawingOverlay() {
  const {
    drawings,
    draft,
    selectedId,
    setSelectedId,
    updateDrawing,
    editAnchor,
    setEditAnchor,
  } = useDrawing();

  const isEditing = selectedId !== null && editAnchor !== null;
  const svgRef = useRef();

  // Called on mouse move over overlay while dragging an anchor
  function handleMouseMove(e) {
    if (isEditing && selectedId != null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const mx = e.clientX - svgRect.left;
      const my = e.clientY - svgRect.top;
      const d = drawings[selectedId];

      if (d.type === "trendline") {
        let updated = { ...d };
        if (editAnchor.type === "move") {
          // Move entire line by delta
          const dx = mx - (d._startX ?? (d.x1 + d.x2) / 2);
          const dy = my - (d._startY ?? (d.y1 + d.y2) / 2);
          updated.x1 += dx;
          updated.x2 += dx;
          updated.y1 += dy;
          updated.y2 += dy;
          updated._startX = mx;
          updated._startY = my;
        }
        if (editAnchor.type === "p1") {
          updated.x1 = mx;
          updated.y1 = my;
        }
        if (editAnchor.type === "p2") {
          updated.x2 = mx;
          updated.y2 = my;
        }
        updateDrawing(selectedId, updated);
      }
      if (d.type === "rectangle") {
        let updated = { ...d };
        if (editAnchor.type === "move") {
          const dx = mx - (d._startX ?? (d.x1 + d.x2) / 2);
          const dy = my - (d._startY ?? (d.y1 + d.y2) / 2);
          updated.x1 += dx;
          updated.x2 += dx;
          updated.y1 += dy;
          updated.y2 += dy;
          updated._startX = mx;
          updated._startY = my;
        }
        if (editAnchor.type.startsWith("corner")) {
          const corner = editAnchor.type[6];
          if (corner === "1") {
            updated.x1 = mx;
            updated.y1 = my;
          }
          if (corner === "2") {
            updated.x2 = mx;
            updated.y1 = my;
          }
          if (corner === "3") {
            updated.x2 = mx;
            updated.y2 = my;
          }
          if (corner === "4") {
            updated.x1 = mx;
            updated.y2 = my;
          }
        }
        updateDrawing(selectedId, updated);
      }
    }
  }

  // Mouse up: finish editing and cleanup helpers
  function handleMouseUp() {
    if (isEditing && selectedId != null) {
      // Remove any _startX/Y
      const d = drawings[selectedId];
      if ("_startX" in d || "_startY" in d) {
        const { _startX, _startY, ...rest } = d;
        updateDrawing(selectedId, rest);
      }
      setEditAnchor(null);
    }
  }

  // Helper for starting move/resize
  function startEdit(event, type) {
    event.stopPropagation();
    setEditAnchor({ type });
    // Record original center for move anchor
    if (selectedId != null) {
      const d = drawings[selectedId];
      if (type === "move") {
        const centerX =
          d.type === "trendline" ? (d.x1 + d.x2) / 2 : (d.x1 + d.x2) / 2;
        const centerY =
          d.type === "trendline" ? (d.y1 + d.y2) / 2 : (d.y1 + d.y2) / 2;
        updateDrawing(selectedId, { ...d, _startX: centerX, _startY: centerY });
      }
    }
  }

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 4, cursor: isEditing ? "move" : "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {drawings.map((d, i) => {
        // === Trendline ===
        if (d.type === "trendline") {
          const selected = i === selectedId;
          return (
            <g key={i} onClick={() => setSelectedId(i)}>
              <line
                x1={d.x1}
                y1={d.y1}
                x2={d.x2}
                y2={d.y2}
                stroke={selected ? "#42a5f5" : "#2962ff"}
                strokeWidth={selected ? 4 : 2.5}
                strokeLinecap="round"
                opacity={selected ? 1 : 0.9}
                filter={selected ? "url(#glow)" : undefined}
              />
              {/* Draw endpoints as anchors when selected */}
              {selected && (
                <>
                  <circle
                    cx={d.x1}
                    cy={d.y1}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "p1")}
                  />
                  <circle
                    cx={d.x2}
                    cy={d.y2}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "p2")}
                  />
                  {/* Move anchor at center */}
                  <circle
                    cx={(d.x1 + d.x2) / 2}
                    cy={(d.y1 + d.y2) / 2}
                    r={7}
                    fill="#fff"
                    stroke="#1976d2"
                    strokeWidth={2}
                    cursor="move"
                    onMouseDown={(e) => startEdit(e, "move")}
                  />
                </>
              )}
            </g>
          );
        }
        // === Rectangle ===
        if (d.type === "rectangle") {
          const selected = i === selectedId;
          const c1 = { x: d.x1, y: d.y1 };
          const c2 = { x: d.x2, y: d.y1 };
          const c3 = { x: d.x2, y: d.y2 };
          const c4 = { x: d.x1, y: d.y2 };
          return (
            <g key={i} onClick={() => setSelectedId(i)}>
              <rect
                x={Math.min(d.x1, d.x2)}
                y={Math.min(d.y1, d.y2)}
                width={Math.abs(d.x2 - d.x1)}
                height={Math.abs(d.y2 - d.y1)}
                fill={
                  selected ? "rgba(66,165,245,0.18)" : "rgba(44,130,201,0.15)"
                }
                stroke={selected ? "#42a5f5" : "#2962ff"}
                strokeWidth={selected ? 3 : 2.5}
                filter={selected ? "url(#glow)" : undefined}
              />
              {selected && (
                <>
                  {/* Four corner resize anchors */}
                  <circle
                    {...c1}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "corner1")}
                  />
                  <circle
                    {...c2}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "corner2")}
                  />
                  <circle
                    {...c3}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "corner3")}
                  />
                  <circle
                    {...c4}
                    r={7}
                    fill="#fff"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    cursor="pointer"
                    onMouseDown={(e) => startEdit(e, "corner4")}
                  />
                  {/* Center move anchor */}
                  <circle
                    cx={(d.x1 + d.x2) / 2}
                    cy={(d.y1 + d.y2) / 2}
                    r={7}
                    fill="#fff"
                    stroke="#1976d2"
                    strokeWidth={2}
                    cursor="move"
                    onMouseDown={(e) => startEdit(e, "move")}
                  />
                </>
              )}
            </g>
          );
        }
        return null;
      })}
      {/* Rest remains unchanged - draft preview, etc */}
      <defs>
        <filter id="glow" x="-5" y="-5" width="40" height="40">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {draft && draft.type === "trendline" && (
        <line
          x1={draft.x1}
          y1={draft.y1}
          x2={draft.x2}
          y2={draft.y2}
          stroke="#2962ff"
          strokeDasharray="4"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.55}
        />
      )}
      {draft && draft.type === "rectangle" && (
        <rect
          x={Math.min(draft.x1, draft.x2)}
          y={Math.min(draft.y1, draft.y2)}
          width={Math.abs(draft.x2 - draft.x1)}
          height={Math.abs(draft.y2 - draft.y1)}
          fill="rgba(44,130,201,0.08)"
          stroke="#2962ff"
          strokeWidth="2.5"
          strokeDasharray="4"
        />
      )}
    </svg>
  );
}
