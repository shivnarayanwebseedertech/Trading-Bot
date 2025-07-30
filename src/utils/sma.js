// utils/sma.js
export function calculateSMA(data, period) {
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
    smaValues.push({ time: data[i].time, value: sum / period });
  }

  return smaValues.filter((point) => point.value !== null);
}
