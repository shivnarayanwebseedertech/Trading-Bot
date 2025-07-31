// src/utils/macd.js

/**
 * Calculate the Moving Average Convergence Divergence (MACD) indicator.
 *
 * @param {Array} data - Array of price bars with { time, close }.
 * @param {Object} options - Parameters for MACD calculation.
 * @param {number} [options.fastPeriod=12] - Fast EMA period.
 * @param {number} [options.slowPeriod=26] - Slow EMA period.
 * @param {number} [options.signalPeriod=9] - Signal line EMA period.
 * @returns {Object} Object containing macd, signal, and histogram arrays of {time, value}.
 */
export function calculateMACD(
  data,
  { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = {}
) {
  if (!data || data.length < slowPeriod)
    return { macd: [], signal: [], histogram: [] };

  // Helper to calculate EMA array for given period
  function ema(period) {
    const k = 2 / (period + 1);
    let prev = data.slice(0, period).reduce((a, b) => a + b.close, 0) / period;
    const arr = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) arr.push(null);
      else if (i === period - 1) arr.push(+prev.toFixed(4));
      else {
        prev = (data[i].close - prev) * k + prev;
        arr.push(+prev.toFixed(4));
      }
    }
    return arr;
  }

  // Calculate fast and slow EMAs
  const emaFast = ema(fastPeriod);
  const emaSlow = ema(slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine = emaFast.map((val, i) =>
    val != null && emaSlow[i] != null ? +(val - emaSlow[i]).toFixed(4) : null
  );

  // Signal line EMA of MACD line
  let prevSignal =
    macdLine
      .slice(0, slowPeriod + signalPeriod - 1)
      .reduce((s, v) => s + (v || 0), 0) / signalPeriod;
  const signal = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (i < slowPeriod + signalPeriod - 2) signal.push(null);
    else if (i === slowPeriod + signalPeriod - 2)
      signal.push(+prevSignal.toFixed(4));
    else {
      prevSignal =
        (macdLine[i] - prevSignal) * (2 / (signalPeriod + 1)) + prevSignal;
      signal.push(+prevSignal.toFixed(4));
    }
  }

  // Histogram = MACD line - Signal line
  const histogram = macdLine.map((v, i) =>
    v != null && signal[i] != null ? +(v - signal[i]).toFixed(4) : null
  );

  const timeSeries = data.map((d) => d.time);

  return {
    macd: timeSeries
      .map((time, i) => ({ time, value: macdLine[i] }))
      .filter((d) => d.value !== null),
    signal: timeSeries
      .map((time, i) => ({ time, value: signal[i] }))
      .filter((d) => d.value !== null),
    histogram: timeSeries
      .map((time, i) => ({ time, value: histogram[i] }))
      .filter((d) => d.value !== null),
  };
}
