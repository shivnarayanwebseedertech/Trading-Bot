import React, { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import { useDrawing } from "../context/DrawingContext";
import { calculateSMA } from "../utils/sma";

// Helper: convert date string to UNIX timestamp (seconds)
function toUnixTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function Chart({ symbol, timeframe, activeIndicators = [] }) {
  const chartDivRef = useRef(null);
  const containerRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [smaSeries, setSmaSeries] = useState(null);
  const { activeTool, draft, setDraft, addDrawing, clearDraft } = useDrawing();

  // 1. Fetch and Set Candle Data
  useEffect(() => {
    if (!symbol) return;

    const data = [
      {
        time: toUnixTimestamp("2025-07-30"),
        open: 100,
        high: 110,
        low: 95,
        close: 105,
      },
      {
        time: toUnixTimestamp("2025-07-31"),
        open: 105,
        high: 115,
        low: 100,
        close: 110,
      },
      {
        time: toUnixTimestamp("2025-08-01"),
        open: 110,
        high: 120,
        low: 105,
        close: 115,
      },
      {
        time: toUnixTimestamp("2025-08-02"),
        open: 115,
        high: 125,
        low: 110,
        close: 118,
      },
      // Add more data as needed
    ];

    setCandleData(data);
    if (candleSeries) candleSeries.setData(data);
  }, [symbol, candleSeries]);

  // 2. Chart and Series Initialization
  useEffect(() => {
    if (!chartDivRef.current) return;

    const chartInstance = createChart(chartDivRef.current, {
      width: chartDivRef.current.clientWidth,
      height: 500,
      layout: { background: "#f5f6fa", textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
    });

    const candleSeriesInstance = chartInstance.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    setChart(chartInstance);
    setCandleSeries(candleSeriesInstance);

    // Responsive resizing
    function handleResize() {
      chartInstance.applyOptions({ width: chartDivRef.current.clientWidth });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.remove();
    };
  }, []);

  // 3. SMA Overlay Management
  useEffect(() => {
    if (!chart || !candleSeries) return;

    // Remove previous SMA overlay if it exists
    if (smaSeries) {
      chart.removeSeries(smaSeries);
      setSmaSeries(null);
    }

    if (activeIndicators.includes("sma") && candleData.length > 0) {
      const smaData = calculateSMA(candleData, 3); // Or use the period picker
      const newSmaSeries = chart.addSeries(LineSeries, {
        color: "blue",
        lineWidth: 2,
      });
      newSmaSeries.setData(smaData);
      setSmaSeries(newSmaSeries);
    }
    // eslint-disable-next-line
  }, [chart, candleSeries, candleData, activeIndicators]);

  // 4. Mouse events for drawing tools: trendline & rectangle
  function getRelativePos(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseDown(e) {
    const { x, y } = getRelativePos(e);
    if (activeTool === "trendline") {
      setDraft({ type: "trendline", x1: x, y1: y, x2: x, y2: y });
    }
    if (activeTool === "rectangle") {
      setDraft({ type: "rectangle", x1: x, y1: y, x2: x, y2: y });
    }
  }

  function handleMouseMove(e) {
    if (!draft) return;
    const { x, y } = getRelativePos(e);
    if (activeTool === "trendline" && draft.type === "trendline") {
      setDraft({ ...draft, x2: x, y2: y });
    }
    if (activeTool === "rectangle" && draft.type === "rectangle") {
      setDraft({ ...draft, x2: x, y2: y });
    }
  }

  function handleMouseUp(e) {
    if (!draft) return;
    const { x, y } = getRelativePos(e);
    if (activeTool === "trendline" && draft.type === "trendline") {
      addDrawing({ ...draft, x2: x, y2: y });
      clearDraft();
    }
    if (activeTool === "rectangle" && draft.type === "rectangle") {
      addDrawing({ ...draft, x2: x, y2: y });
      clearDraft();
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] bg-white dark:bg-gray-800 rounded"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div ref={chartDivRef} className="w-full h-full" />
      {/* <DrawingOverlay /> should be rendered here or in the parent for SVG drawings */}
    </div>
  );
}

export default Chart;
