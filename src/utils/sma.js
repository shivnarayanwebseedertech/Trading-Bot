/**
 * Calculates the Simple Moving Average (SMA) for price data.
 *
 * @param {Array} data - Array of price bars with { time, close }.
 * @param {number} period - Number of bars to average over.
 * @returns {Array} Array of objects { time, value } with SMA values (filtered to exclude null values).
 */
export function calculateSMA(data, period) {
  if (!data || data.length < period) return [];

  const smaValues = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smaValues.push({ time: data[i].time, value: null });
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    // Round to 4 decimals for consistency with other indicators
    smaValues.push({ time: data[i].time, value: +(sum / period).toFixed(4) });
  }

  // Filter out the initial null values for plotting or alerts
  return smaValues.filter((point) => point.value !== null);
}
