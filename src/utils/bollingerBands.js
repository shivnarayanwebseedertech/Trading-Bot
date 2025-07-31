export function calculateBollinger(data, period = 20, stdDev = 2) {
  if (!data || data.length < period)
    return { upper: [], lower: [], middle: [] };
  const middle = [];
  const upper = [];
  const lower = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1).map((d) => d.close);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(
        slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
      );
      middle.push(+mean.toFixed(4));
      upper.push(+(mean + stdDev * std).toFixed(4));
      lower.push(+(mean - stdDev * std).toFixed(4));
    }
  }
  const timeSeries = data.map((d) => d.time);
  return {
    upper: timeSeries
      .map((time, i) => ({ time, value: upper[i] }))
      .filter((d) => d.value !== null),
    middle: timeSeries
      .map((time, i) => ({ time, value: middle[i] }))
      .filter((d) => d.value !== null),
    lower: timeSeries
      .map((time, i) => ({ time, value: lower[i] }))
      .filter((d) => d.value !== null),
  };
}
