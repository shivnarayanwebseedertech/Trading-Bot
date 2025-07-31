export function calculateMACD(
  data,
  { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = {}
) {
  if (!data || data.length < slowPeriod)
    return { macd: [], signal: [], histogram: [] };

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

  const emaFast = ema(fastPeriod);
  const emaSlow = ema(slowPeriod);
  const macdLine = emaFast.map((val, i) =>
    val != null && emaSlow[i] != null ? +(val - emaSlow[i]).toFixed(4) : null
  );
  // Calculate signal
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
  const histogram = macdLine.map((v, i) =>
    v != null && signal[i] != null ? +(v - signal[i]).toFixed(4) : null
  );
  // Output array of {time,value} for each line
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
