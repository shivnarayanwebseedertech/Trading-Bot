// src/components/PortfolioPanel.jsx
import React from "react";

// Dummy trades data for demonstration - replace with real API data later
const dummyTrades = [
  { symbol: "AAPL", side: "buy", qty: 10, price: 195.4, time: "09:05" },
  { symbol: "AAPL", side: "sell", qty: 5, price: 199.1, time: "09:15" },
];

export default function PortfolioPanel() {
  return (
    <div className="overflow-auto max-h-60 border rounded bg-white dark:bg-gray-900 p-2">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="px-3 py-2">Symbol</th>
            <th className="px-3 py-2">Side</th>
            <th className="px-3 py-2">Quantity</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {dummyTrades.map((trade, index) => (
            <tr
              key={index}
              className={`border-b border-gray-200 dark:border-gray-700 ${
                trade.side === "buy" ? "text-green-600" : "text-red-600"
              }`}
            >
              <td className="px-3 py-1 font-mono">{trade.symbol}</td>
              <td className="px-3 py-1">{trade.side.toUpperCase()}</td>
              <td className="px-3 py-1">{trade.qty}</td>
              <td className="px-3 py-1">${trade.price.toFixed(2)}</td>
              <td className="px-3 py-1">{trade.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
