/**
 * Calculates the Relative Strength Index (RSI) for price data.
 *
 * @param {Array} data - Array of price bars, each with { time, close }.
 * @param {number} period - Lookback period for RSI calculation (default 14).
 * @returns {Array} Array of objects { time, value } where value is RSI, excluding initial nulls.
 */
export function calculateRSI(data, period = 14) {
  if (!data || data.length < period) return [];

  let gain = 0;
  let loss = 0;

  // Calculate initial average gain and loss over first (period - 1) intervals
  for (let i = 1; i < period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gain += diff;
    else loss -= diff; // subtract since diff < 0
  }

  // Avoid division by zero by using a small epsilon
  let rs = gain / (loss || 1e-8);
  const rsiArr = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      // RSI undefined for first 'period' bars (push null to maintain alignment)
      rsiArr.push({ time: data[i].time, value: null });
    } else if (i === period) {
      // Calculate first RSI value using initial average gain/loss
      const value = 100 - 100 / (1 + rs);
      rsiArr.push({ time: data[i].time, value: +value.toFixed(4) });
    } else {
      // For subsequent bars, use Wilder's smoothing method
      const diff = data[i].close - data[i - 1].close;
      const currGain = diff > 0 ? diff : 0;
      const currLoss = diff < 0 ? -diff : 0;

      gain = (gain * (period - 1) + currGain) / period;
      loss = (loss * (period - 1) + currLoss) / period;

      rs = gain / (loss || 1e-8);
      const value = 100 - 100 / (1 + rs);
      rsiArr.push({ time: data[i].time, value: +value.toFixed(4) });
    }
  }

  // Return only the valid RSI points - those with non-null values
  return rsiArr.filter((point) => point.value !== null);
}
