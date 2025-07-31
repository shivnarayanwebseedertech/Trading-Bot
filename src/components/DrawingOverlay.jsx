import React, { useRef } from "react";
import { useDrawing } from "../context/DrawingContext";

// Helper for drawing Fibonacci levels
function drawFibLines(d, width = 2000) {
  const levels = [
    { p: 0, color: "#e53935" },
    { p: 0.236, color: "#8e24aa" },
    { p: 0.382, color: "#3949ab" },
    { p: 0.5, color: "#039be5" },
    { p: 0.618, color: "#43a047" },
    { p: 0.786, color: "#fbc02d" },
    { p: 1, color: "#e53935" },
  ];
  const { x1, x2, y1, y2 } = d;
  return levels.map((l, idx) => {
    const ly = y1 + (y2 - y1) * l.p;
    return (
      <g key={idx}>
        <line
          x1={x1}
          y1={ly}
          x2={x2}
          y2={ly}
          stroke={l.color}
          strokeDasharray="6"
          strokeWidth="2"
        />
        <text
          x={Math.max(x1, x2) + 8}
          y={ly + 2}
          fontSize={11}
          fill={l.color}
          alignmentBaseline="middle"
        >
          {(l.p * 100).toFixed(1)}%
        </text>
      </g>
    );
  });
}

export default function DrawingOverlay({ alerts }) {
  const {
    drawings,
    draft,
    selectedId,
    setSelectedId,
    updateDrawing,
    editAnchor,
    setEditAnchor,
  } = useDrawing();

  const svgRef = useRef();
  const isEditing = selectedId !== null && editAnchor !== null;

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 4, cursor: isEditing ? "move" : "crosshair" }}
    >
      {/* Alert horizontal markers (drawn if alerts are passed in) */}
      {alerts &&
        alerts.map((a, idx) => (
          <g key={`alert-${a.id || idx}`}>
            <line
              x1={0}
              y1={a.y} // YOU must pass pixel y value—calculate from price in parent!
              x2={2000}
              y2={a.y}
              stroke="#fbc02d"
              strokeDasharray="4"
              strokeWidth="2"
              opacity={0.8}
            />
            <text
              x={2000 - 18}
              y={a.y - 2}
              fontSize={16}
              fill="#fbc02d"
              style={{ userSelect: "none" }}
              title="Active Alert"
            >
              🔔
            </text>
          </g>
        ))}

      {drawings.map((d, i) =>
        d.type === "trendline" ? (
          <g key={i} onClick={() => setSelectedId(i)}>
            <line
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              stroke={i === selectedId ? "#2962ff" : "#009688"}
              strokeWidth={i === selectedId ? 3.5 : 2}
              filter={i === selectedId ? "url(#glow)" : ""}
              style={{ cursor: "pointer" }}
            />
          </g>
        ) : d.type === "rectangle" ? (
          <g key={i} onClick={() => setSelectedId(i)}>
            <rect
              x={Math.min(d.x1, d.x2)}
              y={Math.min(d.y1, d.y2)}
              width={Math.abs(d.x2 - d.x1)}
              height={Math.abs(d.y2 - d.y1)}
              fill="rgba(44,130,201,0.08)"
              stroke="#2962ff"
              strokeWidth={i === selectedId ? 3.5 : 2}
              strokeDasharray={i === selectedId ? "0" : "5"}
              filter={i === selectedId ? "url(#glow)" : ""}
            />
          </g>
        ) : d.type === "hline" ? (
          <line
            key={i}
            x1={0}
            y1={d.y}
            x2={2000}
            y2={d.y}
            stroke="#8e24aa"
            strokeDasharray="6"
            strokeWidth="2"
            opacity={0.8}
          />
        ) : d.type === "text" ? (
          <text
            key={i}
            x={d.x}
            y={d.y}
            fontSize={15}
            fontWeight="bold"
            fill="#1e88e5"
            stroke="#fff"
            strokeWidth={0.7}
            paintOrder="stroke"
            alignmentBaseline="middle"
            textAnchor="middle"
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            onClick={() => setSelectedId(i)}
          >
            {d.text}
          </text>
        ) : d.type === "arrow" ? (
          <g key={i} onClick={() => setSelectedId(i)}>
            <line
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              stroke="#43a047"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0,0 10,3.5 0,7" fill="#43a047" />
              </marker>
            </defs>
          </g>
        ) : d.type === "fib" ? (
          <g key={i} onClick={() => setSelectedId(i)}>
            {drawFibLines(d, 2000)}
          </g>
        ) : null
      )}
      {/* Draft preview for all tools */}
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
      {draft && draft.type === "arrow" && (
        <g>
          <line
            x1={draft.x1}
            y1={draft.y1}
            x2={draft.x2}
            y2={draft.y2}
            stroke="#43a047"
            strokeDasharray="4"
            strokeWidth="3"
            markerEnd="url(#arrowheaddraft)"
          />
          <defs>
            <marker
              id="arrowheaddraft"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 10,3.5 0,7" fill="#43a047" />
            </marker>
          </defs>
        </g>
      )}
      {draft && draft.type === "fib" && <g>{drawFibLines(draft, 2000)}</g>}

      {/* Glow filter for selection */}
      <defs>
        <filter id="glow" x="-5" y="-5" width="40" height="40">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
