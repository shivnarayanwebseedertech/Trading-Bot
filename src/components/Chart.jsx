import React, { useRef, useEffect, useState } from "react";
import { createChart } from "lightweight-charts";

import { useDrawing } from "../context/DrawingContext";
import { calculateSMA } from "../utils/sma";
import { calculateEMA } from "../utils/ema";
import { calculateRSI } from "../utils/rsi";
import { calculateMACD } from "../utils/macd";
import { calculateBollinger } from "../utils/bollingerBands";
import DrawingOverlay from "./DrawingOverlay";

function toUnixTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function Chart({ symbol, timeframe, activeIndicators = [] }) {
  const chartDivRef = useRef(null);
  const containerRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);
  const [candleData, setCandleData] = useState([]);

  const indicatorSeriesRef = useRef({});
  const { activeTool, draft, setDraft, addDrawing, clearDraft } = useDrawing();

  // Load dummy candle data
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
  }, [symbol, timeframe, candleSeries]);

  // Create chart and candlestick series
  useEffect(() => {
    if (!chartDivRef.current) return;

    const chartInstance = createChart(chartDivRef.current, {
      width: chartDivRef.current.clientWidth,
      height: 500,
      layout: {
        backgroundColor: "#f5f6fa",
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
    });

    const candle = chartInstance.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    setChart(chartInstance);
    setCandleSeries(candle);

    const handleResize = () => {
      chartInstance.applyOptions({ width: chartDivRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.remove();
    };
  }, []);

  // Add overlays (SMA, EMA, etc.)
  useEffect(() => {
    if (!chart || !candleSeries || candleData.length === 0) return;

    Object.values(indicatorSeriesRef.current).forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch {}
    });
    indicatorSeriesRef.current = {};

    const addOverlay = (key, data, options) => {
      const series = chart.addLineSeries(options);
      series.setData(data);
      indicatorSeriesRef.current[key] = series;
    };

    if (activeIndicators.some((i) => i.key === "sma")) {
      const smaData = calculateSMA(candleData, 3);
      addOverlay("sma", smaData, { color: "#1976d2", lineWidth: 2 });
    }

    if (activeIndicators.some((i) => i.key === "ema")) {
      const emaData = calculateEMA(candleData, 9);
      addOverlay("ema", emaData, {
        color: "#ff9800",
        lineWidth: 2,
        lineStyle: 1,
      });
    }

    if (activeIndicators.some((i) => i.key === "rsi")) {
      const rsiData = calculateRSI(candleData, 14);
      addOverlay("rsi", rsiData, {
        color: "#f50057",
        lineWidth: 1,
        lineStyle: 2,
      });
    }

    if (activeIndicators.some((i) => i.key === "macd")) {
      const { macd, signal } = calculateMACD(candleData);
      addOverlay("macd", macd, { color: "#009688", lineWidth: 1 });
      addOverlay("macdSignal", signal, { color: "#9c27b0", lineWidth: 1 });
    }

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

    return () => {
      Object.values(indicatorSeriesRef.current).forEach((series) => {
        try {
          chart.removeSeries(series);
        } catch {}
      });
      indicatorSeriesRef.current = {};
    };
  }, [chart, candleSeries, candleData, activeIndicators]);

  // Drawing interaction
  function getRelativePos(event) {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handleMouseDown(event) {
    const { x, y } = getRelativePos(event);
    switch (activeTool) {
      case "trendline":
        setDraft({ type: "trendline", x1: x, y1: y, x2: x, y2: y });
        break;
      case "rectangle":
        setDraft({ type: "rectangle", x1: x, y1: y, x2: x, y2: y });
        break;
      case "arrow":
        setDraft({ type: "arrow", x1: x, y1: y, x2: x, y2: y });
        break;
      case "fib":
        setDraft({ type: "fib", x1: x, y1: y, x2: x, y2: y });
        break;
      case "hline":
        addDrawing({ type: "hline", y });
        setDraft(null);
        break;
      case "text":
        const text = prompt("Enter text label:");
        if (text) addDrawing({ type: "text", x, y, text });
        setDraft(null);
        break;
      default:
        break;
    }
  }

  function handleMouseMove(event) {
    if (!draft) return;
    const { x, y } = getRelativePos(event);
    if (draft.type === activeTool) {
      setDraft({ ...draft, x2: x, y2: y });
    }
  }

  function handleMouseUp(event) {
    if (!draft) return;
    const { x, y } = getRelativePos(event);
    if (draft.type === activeTool) {
      addDrawing({ ...draft, x2: x, y2: y });
      clearDraft();
    }
  }

  return (
    <div
      className="relative w-full h-[500px]"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ userSelect: "none" }}
    >
      <div ref={chartDivRef} className="w-full h-full" />
      <DrawingOverlay />
    </div>
  );
}

export default Chart;
