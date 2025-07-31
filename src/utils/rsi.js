export function calculateRSI(data, period = 14) {
  if (!data || data.length < period) return [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let rs = gain / (loss || 1e-8);
  let rsiArr = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsiArr.push({ time: data[i].time, value: null });
    } else if (i === period) {
      const value = 100 - 100 / (1 + rs);
      rsiArr.push({ time: data[i].time, value: +value.toFixed(4) });
    } else {
      const diff = data[i].close - data[i - 1].close;
      let currGain = diff > 0 ? diff : 0;
      let currLoss = diff < 0 ? -diff : 0;
      gain = (gain * (period - 1) + currGain) / period;
      loss = (loss * (period - 1) + currLoss) / period;
      rs = gain / (loss || 1e-8);
      const value = 100 - 100 / (1 + rs);
      rsiArr.push({ time: data[i].time, value: +value.toFixed(4) });
    }
  }
  return rsiArr.filter((point) => point.value !== null);
}
