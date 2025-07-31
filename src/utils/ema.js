export function calculateEMA(data, period = 9) {
  if (!data || data.length < period) return [];

  const k = 2 / (period + 1);
  // Calculate the initial SMA for first period to seed EMA
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

  // Return only points with valid value
  return ema.filter((point) => point.value !== null);
}
