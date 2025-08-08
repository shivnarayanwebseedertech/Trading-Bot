import React from "react";

export default function PortfolioPanel({ trades = [] }) {
  const calculatePnL = (trade) => {
    // Assuming currentPrice would come from props or real-time data
    // For demo purposes, using a mock current price
    const currentPrice = 200.00; // This should come from real-time data
    
    if (trade.side === 'buy') {
      return (currentPrice - trade.price) * trade.qty;
    } else {
      return (trade.price - currentPrice) * trade.qty;
    }
  };

  const calculatePnLPercentage = (trade) => {
    const pnl = calculatePnL(trade);
    const investedAmount = trade.price * trade.qty;
    return ((pnl / investedAmount) * 100).toFixed(2);
  };

  // Sample trades data for demonstration - replace with real API data later
  const dummyTrades = [
    { id: 1, symbol: "AAPL", side: "buy", qty: 10, price: 195.4, time: "09:05" },
    { id: 2, symbol: "AAPL", side: "sell", qty: 5, price: 199.1, time: "09:15" },
  ];

  // Use provided trades or fall back to dummy data
  const tradesData = trades.length > 0 ? trades : dummyTrades;

  return (
    <div className="overflow-auto max-h-60 border rounded bg-white dark:bg-gray-900 p-2">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="px-3 py-2">Symbol</th>
            <th className="px-3 py-2">Side</th>
            <th className="px-3 py-2">Quantity</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">P/L</th>
            <th className="px-3 py-2">P/L %</th>
          </tr>
        </thead>
        <tbody>
          {tradesData.map((trade) => {
            const pnl = calculatePnL(trade);
            const pnlPercentage = calculatePnLPercentage(trade);
            const pnlColor = pnl >= 0 ? 'text-green-500' : 'text-red-500';
            const sideColor = trade.side === "buy" ? "text-green-600" : "text-red-600";
            
            return (
              <tr
                key={trade.id || trade.symbol + trade.time}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="px-3 py-1 font-mono">{trade.symbol}</td>
                <td className={`px-3 py-1 ${sideColor}`}>{trade.side.toUpperCase()}</td>
                <td className="px-3 py-1">{trade.qty}</td>
                <td className="px-3 py-1">${trade.price.toFixed(2)}</td>
                <td className={`px-3 py-1 ${pnlColor}`}>
                  ${pnl.toFixed(2)}
                </td>
                <td className={`px-3 py-1 ${pnlColor}`}>
                  {pnlPercentage}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}