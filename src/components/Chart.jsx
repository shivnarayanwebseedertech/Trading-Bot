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

const API_KEY = "demo";

function Chart({ symbol, timeframe, activeIndicators = [] }) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const chartDivRef = useRef(null);
  const containerRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const indicatorSeriesRef = useRef({});
  const { activeTool, draft, setDraft, addDrawing, clearDraft } = useDrawing();
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: '' });

  // Monitor dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Generate proper mock candlestick data
  const generateMockCandleData = (symbol, count = 100) => {
    const basePrice = {
      "AAPL": 190,
      "MSFT": 420, 
      "GOOGL": 175,
      "AMZN": 180,
      "TSLA": 250,
      "EUR/USD": 1.0800,
      "GBP/USD": 1.2500,
      "USD/JPY": 150.00,
      "BTC/USD": 45000,
      "ETH/USD": 3000
    }[symbol] || 100;
    
    const data = [];
    let price = basePrice;
    const now = Math.floor(Date.now() / 1000);
    const timeInterval = timeframe === "1m" ? 60 : 
                        timeframe === "5m" ? 300 : 
                        timeframe === "15m" ? 900 : 
                        timeframe === "1h" ? 3600 : 86400;
    
    for (let i = 0; i < count; i++) {
      const time = now - (count - i) * timeInterval;
      const open = price;
      const volatility = 0.02;
      const trend = Math.sin(i / 10) * 0.001;
      const randomMove = (Math.random() - 0.5) * volatility + trend;
      const close = open + (open * randomMove);
      const range = Math.abs(close - open);
      const extraRange = range * (0.5 + Math.random() * 1.5);
      const high = Math.max(open, close) + (Math.random() * extraRange);
      const low = Math.min(open, close) - (Math.random() * extraRange);
      const finalHigh = Math.max(high, open, close);
      const finalLow = Math.min(low, open, close);
      
      data.push({
        time: time,
        open: Number(open.toFixed(4)),
        high: Number(finalHigh.toFixed(4)),
        low: Number(finalLow.toFixed(4)),
        close: Number(close.toFixed(4))
      });
      
      price = close;
    }
    
    return data;
  };
  
  // Fetch or generate candle data
  useEffect(() => {
    if (!symbol || !timeframe) {
      return;
    }
    
    if (API_KEY === "demo") {
      const mockData = generateMockCandleData(symbol, 150);
      setCandleData(mockData);
    } else {
      const apiSym = symbol.replace("/", "");
      axios.get(`https://api.twelvedata.com/time_series`, {
        params: {
          symbol: apiSym,
          interval: INTERVALS[timeframe],
          outputsize: 300,
          apikey: API_KEY,
        },
      })
      .then((res) => {
        if (!res.data.values) {
          throw new Error(res.data.message || "API returned no values");
        }
        
        const fetchedData = res.data.values.reverse().map((entry) => ({
          time: Math.floor(new Date(entry.datetime).getTime() / 1000),
          open: Number(entry.open),
          high: Number(entry.high),
          low: Number(entry.low),
          close: Number(entry.close),
        }));
        
        setCandleData(fetchedData);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setCandleData(generateMockCandleData(symbol, 150));
      });
    }
  }, [symbol, timeframe]);

  // Initialize chart
  useEffect(() => {
    if (!chartDivRef.current) return;
    
    if (chart) {
      chart.remove();
    }
    
    const newChart = createChart(chartDivRef.current, {
      width: chartDivRef.current.offsetWidth,
      height: chartDivRef.current.offsetHeight,
      layout: {
        background: { color: isDarkMode ? '#1e1e2d' : '#ffffff' },
        textColor: isDarkMode ? '#d1d4dc' : '#333333',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#2a2e39' : '#e6e8ea' },
        horzLines: { color: isDarkMode ? '#2a2e39' : '#e6e8ea' },
      },
      timeScale: {
        borderColor: isDarkMode ? '#2a2e39' : '#e6e8ea',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#2a2e39' : '#e6e8ea',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });
    
    const candleSeriesConfig = {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: true,
      wickVisible: true,
    };
    
    const newCandleSeries = newChart.addCandlestickSeries(candleSeriesConfig);
    
    setChart(newChart);
    setCandleSeries(newCandleSeries);

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0].target !== chartDivRef.current) {
        return;
      }
      
      const { width, height } = entries[0].contentRect;
      newChart.applyOptions({ width, height });
    });
    
    resizeObserver.observe(chartDivRef.current);

    return () => {
      resizeObserver.disconnect();
      newChart.remove();
    };
  }, [isDarkMode]);
  
  // Set candlestick data when available
  useEffect(() => {
    if (!candleSeries || !candleData.length) {
      return;
    }
    
    try {
      const validData = candleData.filter(candle => 
        candle.time && 
        typeof candle.open === 'number' && 
        typeof candle.high === 'number' && 
        typeof candle.low === 'number' && 
        typeof candle.close === 'number' &&
        candle.high >= candle.low &&
        candle.high >= Math.max(candle.open, candle.close) &&
        candle.low <= Math.min(candle.open, candle.close)
      );
      
      if (validData.length > 0) {
        candleSeries.setData(validData);
        
        setTimeout(() => {
          if (chart) {
            chart.timeScale().fitContent();
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error setting candlestick data:", error);
    }
  }, [candleSeries, candleData, chart]);

  // Add technical indicators
  useEffect(() => {
    if (!chart || !candleSeries || !candleData.length) return;
    
    Object.values(indicatorSeriesRef.current).forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch (e) {
        console.warn("Error removing indicator series:", e);
      }
    });
    indicatorSeriesRef.current = {};
    
    activeIndicators.forEach(indicator => {
      try {
        switch (indicator.key) {
          case "sma": {
            const smaData = calculateSMA(candleData, 20);
            if (smaData && smaData.length > 0) {
              const series = chart.addLineSeries({
                color: '#1976d2',
                lineWidth: 2,
                title: 'SMA(20)',
              });
              series.setData(smaData);
              indicatorSeriesRef.current.sma = series;
            }
            break;
          }
          case "ema": {
            const emaData = calculateEMA(candleData, 9);
            if (emaData && emaData.length > 0) {
              const series = chart.addLineSeries({
                color: '#ff9800',
                lineWidth: 2,
                lineStyle: 1,
                title: 'EMA(9)',
              });
              series.setData(emaData);
              indicatorSeriesRef.current.ema = series;
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error adding ${indicator.key} indicator:`, error);
      }
    });
  }, [chart, candleSeries, candleData, activeIndicators]);

  // Get mouse coordinates relative to chart
  const getMouseCoords = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Handle mouse down for drawing
  const handleMouseDown = (event) => {
    if (!activeTool || activeTool === 'select') return;
    
    const { x, y } = getMouseCoords(event);
    
    // Handle text tool separately
    if (activeTool === 'text') {
      setTextInput({
        show: true,
        x: x,
        y: y,
        value: ''
      });
      return;
    }

    // Handle horizontal line tool
    if (activeTool === 'hline') {
      const drawing = {
        type: 'hline',
        y: y
      };
      addDrawing(drawing);
      return;
    }

    // For tools that need dragging
    setIsDrawing(true);
    
    const initialDraft = {
      type: activeTool,
      x1: x,
      y1: y,
      x2: x,
      y2: y
    };
    
    setDraft(initialDraft);
  };

  // Handle mouse move for drawing  
  const handleMouseMove = (event) => {
    if (!isDrawing || !draft) return;
    
    const { x, y } = getMouseCoords(event);
    
    setDraft(prev => ({
      ...prev,
      x2: x,
      y2: y
    }));
  };

  // Handle mouse up for drawing
  const handleMouseUp = () => {
    if (!isDrawing || !draft) return;
    
    // Only add drawing if there's meaningful movement
    const hasMovement = Math.abs(draft.x2 - draft.x1) > 3 || Math.abs(draft.y2 - draft.y1) > 3;
    
    if (hasMovement) {
      addDrawing(draft);
    }
    
    setIsDrawing(false);
    clearDraft();
  };

  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.value.trim()) {
      const drawing = {
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.value.trim()
      };
      addDrawing(drawing);
    }
    
    setTextInput({ show: false, x: 0, y: 0, value: '' });
  };

  // Handle text input key press
  const handleTextKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTextSubmit();
    } else if (event.key === 'Escape') {
      setTextInput({ show: false, x: 0, y: 0, value: '' });
    }
  };

  // Get cursor style based on active tool
  const getCursorStyle = () => {
    if (activeTool === 'select') return 'default';
    if (activeTool === 'text') return 'text';
    return 'crosshair';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        userSelect: "none", 
        minHeight: "400px",
        cursor: getCursorStyle()
      }}
    >
      <div 
        ref={chartDivRef} 
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
      
      <DrawingOverlay />
      
      {/* Text input overlay */}
      {textInput.show && (
        <input
          type="text"
          value={textInput.value}
          onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
          onKeyDown={handleTextKeyPress}
          onBlur={handleTextSubmit}
          className="absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm z-50"
          style={{
            left: textInput.x,
            top: textInput.y - 25,
            minWidth: '100px'
          }}
          placeholder="Enter text..."
          autoFocus
        />
      )}
    </div>
  );
}

export default Chart;