import React, { useRef, useEffect, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";
import { useDrawing } from "../context/DrawingContext";
import { calculateSMA } from "../utils/sma";
import { calculateEMA } from "../utils/ema";
import { calculateRSI } from "../utils/rsi";
import { calculateMACD } from "../utils/macd";
import { calculateBollinger } from "../utils/bollingerBands";
import DrawingOverlay from "./DrawingOverlay";

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

  // For cleanup
  const indicatorSeriesRef = useRef({}); // {sma: LineSeries, ema:..., rsi:..., macd:..., bb:...}

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

    function handleResize() {
      chartInstance.applyOptions({ width: chartDivRef.current.clientWidth });
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.remove();
    };
  }, []);

  // 3. Multi-Indicator Overlays Management (SMA, EMA, RSI, MACD, Bollinger Bands)
  useEffect(() => {
    if (!chart || !candleSeries || candleData.length === 0) return;

    // Clean up previous overlays
    Object.values(indicatorSeriesRef.current).forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch {
        /* safe cleanup */
      }
    });
    indicatorSeriesRef.current = {};

    // Helper to add indicator
    const addOverlay = (key, data, options) => {
      const series = chart.addSeries(LineSeries, options);
      series.setData(data);
      indicatorSeriesRef.current[key] = series;
    };

    // SMA
    if (activeIndicators.some((i) => i.key === "sma")) {
      const smaData = calculateSMA(candleData, 3);
      addOverlay("sma", smaData, {
        color: "#1976d2",
        lineWidth: 2,
        lineStyle: 0,
      });
    }
    // EMA
    if (activeIndicators.some((i) => i.key === "ema")) {
      const emaData = calculateEMA(candleData, 9);
      addOverlay("ema", emaData, {
        color: "#ff9800",
        lineWidth: 2,
        lineStyle: 1,
      });
    }
    // RSI (as overlay; advanced: render in own panel)
    if (activeIndicators.some((i) => i.key === "rsi")) {
      const rsiData = calculateRSI(candleData, 14);
      addOverlay("rsi", rsiData, {
        color: "#f50057",
        lineWidth: 1,
        lineStyle: 2,
      });
    }
    // MACD (MACD and signal lines - as overlays)
    if (activeIndicators.some((i) => i.key === "macd")) {
      const { macd, signal } = calculateMACD(candleData);
      addOverlay("macd", macd, {
        color: "#009688",
        lineWidth: 1,
        lineStyle: 0,
      });
      addOverlay("macdSignal", signal, {
        color: "#9c27b0",
        lineWidth: 1,
        lineStyle: 1,
      });
      // You can also display histogram using HistogramSeries if desired.
    }
    // Bollinger Bands (upper, lower, middle)
    if (activeIndicators.some((i) => i.key === "bbands" || i.key === "bb")) {
      const { upper, lower, middle } = calculateBollinger(candleData, 20, 2);
      addOverlay("bbUpper", upper, {
        color: "#43a047",
        lineWidth: 1,
        lineStyle: 1,
      });
      addOverlay("bbLower", lower, {
        color: "#43a047",
        lineWidth: 1,
        lineStyle: 1,
      });
      addOverlay("bbMiddle", middle, {
        color: "#607d8b",
        lineWidth: 1,
        lineStyle: 2,
      });
    }

    // Cleanup series on any change
    return () => {
      Object.values(indicatorSeriesRef.current).forEach((series) => {
        try {
          chart.removeSeries(series);
        } catch {}
      });
      indicatorSeriesRef.current = {};
    };
  }, [chart, candleSeries, candleData, activeIndicators]);

  // --- Drawing Tools: Drawing creation logic as before ---
  function getRelativePos(e) {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function handleMouseDown(e) {
    const { x, y } = getRelativePos(e);
    if (activeTool === "trendline")
      return setDraft({ type: "trendline", x1: x, y1: y, x2: x, y2: y });
    if (activeTool === "rectangle")
      return setDraft({ type: "rectangle", x1: x, y1: y, x2: x, y2: y });
    if (activeTool === "arrow")
      return setDraft({ type: "arrow", x1: x, y1: y, x2: x, y2: y });
    if (activeTool === "fib")
      return setDraft({ type: "fib", x1: x, y1: y, x2: x, y2: y });
    if (activeTool === "hline") {
      addDrawing({ type: "hline", y });
      setDraft(null);
      return;
    }
    if (activeTool === "text") {
      const userText = prompt("Enter text label:");
      if (userText) addDrawing({ type: "text", x, y, text: userText });
      setDraft(null);
      return;
    }
  }
  function handleMouseMove(e) {
    if (!draft) return;
    const { x, y } = getRelativePos(e);
    if (draft.type && draft.type === activeTool)
      setDraft({ ...draft, x2: x, y2: y });
  }
  function handleMouseUp(e) {
    if (!draft) return;
    const { x, y } = getRelativePos(e);
    if (draft.type && draft.type === activeTool) {
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
      style={{ userSelect: "none" }}
    >
      <div
        ref={chartDivRef}
        className="w-full h-full"
        style={{ pointerEvents: "none" }}
      />
      <DrawingOverlay />
    </div>
  );
}

export default Chart;
