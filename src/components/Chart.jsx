import React, { useRef, useEffect, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";
import { useDrawing } from "../context/DrawingContext";
import { calculateSMA } from "../utils/sma";
import { calculateEMA } from "../utils/ema";
import { calculateRSI } from "../utils/rsi";
import { calculateMACD } from "../utils/macd";
import { calculateBollinger } from "../utils/bollingerBands";
import DrawingOverlay from "./DrawingOverlay";

// Map interval label to Twelve Data API interval.
const INTERVALS = {
  "1s": "1s",
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "30m": "30min",
  "1h": "1h",
  "1d": "1day",
  "2d": "2day",
  "3d": "3day",
  "5d": "5day",
  "1w": "1week",
  "2w": "2week",
  "3w": "3week",
  "1mo": "1month",
  "2mo": "2month",
  "3mo": "3month",
  "5mo": "5month",
  "6mo": "6month",
  "1y": "1year",
  "2y": "2year",
  "5y": "5year",
};
// TwelveData API key from .env
const API_KEY = import.meta.env.VITE_MARKET_API_KEY || "demo";

function Chart({ symbol, timeframe, activeIndicators = [] }) {
  const chartDivRef = useRef(null);
  const containerRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const indicatorSeriesRef = useRef({});
  const { activeTool, draft, setDraft, addDrawing, clearDraft } = useDrawing();

  // ========= 1. Fetch candle data from Twelve Data API =========
  useEffect(() => {
    if (!symbol || !INTERVALS[timeframe]) return;
    setCandleData([]);
    // For forex and crypto, TwelveData expects EUR/USD as EURUSD
    const apiSym = symbol.replace("/", "");
    axios
      .get(`https://api.twelvedata.com/time_series`, {
        params: {
          symbol: apiSym,
          interval: INTERVALS[timeframe],
          outputsize: 5000,
          apikey: API_KEY,
        },
      })
      .then((res) => {
        if (!res.data.values)
          throw new Error(res.data.message || "API returned no values");
        const fetchedData = res.data.values.reverse().map((entry) => ({
          time: Math.floor(new Date(entry.datetime).getTime() / 1000),
          open: +entry.open,
          high: +entry.high,
          low: +entry.low,
          close: +entry.close,
        }));
        setCandleData(fetchedData);
        if (candleSeries) candleSeries.setData(fetchedData);
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [symbol, timeframe, candleSeries]);

  // ========= 2. Chart and candle series initialization =========
  useEffect(() => {
    if (!chartDivRef.current) return;
    const chartInstance = createChart(chartDivRef.current, {
      width: chartDivRef.current.clientWidth,
      height: 500,
      layout: { background: "#f5f6fa", textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
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

    // Responsive: update width on resize
    function handleResize() {
      chartInstance.applyOptions({ width: chartDivRef.current.clientWidth });
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.remove();
    };
  }, []);

  // ========= 3. Add overlays (SMA, EMA, RSI, etc...) =========
  useEffect(() => {
    if (!chart || !candleSeries || !candleData.length) return;
    // Clean up overlays
    Object.values(indicatorSeriesRef.current).forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch {}
    });
    indicatorSeriesRef.current = {};
    // Add overlays
    const addOverlay = (key, data, options) => {
      const series = chart.addLineSeries(options);
      series.setData(data);
      indicatorSeriesRef.current[key] = series;
    };
    if (activeIndicators.some((i) => i.key === "sma"))
      addOverlay("sma", calculateSMA(candleData, 3), {
        color: "#1976d2",
        lineWidth: 2,
      });
    if (activeIndicators.some((i) => i.key === "ema"))
      addOverlay("ema", calculateEMA(candleData, 9), {
        color: "#ff9800",
        lineWidth: 2,
        lineStyle: 1,
      });
    if (activeIndicators.some((i) => i.key === "rsi"))
      addOverlay("rsi", calculateRSI(candleData, 14), {
        color: "#f50057",
        lineWidth: 1,
        lineStyle: 2,
      });
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

  // ========= 4. Drawing event handlers (unchanged) =========
  function getRelativePos(event) {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    if (draft.type === activeTool) setDraft({ ...draft, x2: x, y2: y });
  }
  function handleMouseUp(event) {
    if (!draft) return;
    const { x, y } = getRelativePos(event);
    if (draft.type === activeTool) {
      addDrawing({ ...draft, x2: x, y2: y });
      clearDraft();
    }
  }

  // ========= 5. Render chart/overlay container =========
  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px]"
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
