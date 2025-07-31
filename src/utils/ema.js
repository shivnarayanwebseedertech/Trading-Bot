/**
 * Calculates Exponential Moving Average (EMA) over price data.
 * @param {Array} data - Array of price objects with { time, close }.
 * @param {number} period - Period for EMA calculation (default 9).
 * @returns {Array} Array of { time, value } objects where value is EMA.
 */
export function calculateEMA(data, period = 9) {
  if (!data || data.length < period) return [];

  const k = 2 / (period + 1);
  // Calculate initial SMA for first 'period' closes to seed EMA
  let emaPrev =
    data.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) /
    period;

  const ema = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push({ time: data[i].time, value: null });
    } else if (i === period - 1) {
      ema.push({ time: data[i].time, value: +emaPrev.toFixed(4) });
    } else {
      emaPrev = (data[i].close - emaPrev) * k + emaPrev;
      ema.push({ time: data[i].time, value: +emaPrev.toFixed(4) });
    }
  }

  return ema.filter((point) => point.value !== null);
}
