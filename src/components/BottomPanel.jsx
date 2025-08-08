import React from "react";
import PortfolioPanel from "./PortfolioPanel";

export default function BottomPanel({ symbol, orders = [] }) {
  const calculatePnL = (order) => {
    // Assuming currentPrice would come from props or state
    // For demo purposes, using a mock current price
    const currentPrice = 200.00; // This should come from real-time data
    
    if (order.type === 'BUY') {
      return (currentPrice - order.price) * order.quantity;
    } else {
      return (order.price - currentPrice) * order.quantity;
    }
  };

  const calculatePnLPercentage = (order) => {
    const pnl = calculatePnL(order);
    const investedAmount = order.price * order.quantity;
    return ((pnl / investedAmount) * 100).toFixed(2);
  };

  // Sample orders data structure for backend integration
  const sampleOrders = orders.length > 0 ? orders : [
    {
      id: 1,
      symbol: symbol || 'AAPL',
      type: 'BUY',
      quantity: 10,
      price: 195.40
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-t mt-4 rounded-b-xl">
      <div className="grid grid-cols-2 gap-4 p-3 h-52">
        <div className="overflow-y-auto">
          <h3 className="font-bold mb-2">Orders</h3>
          <div className="overflow-auto max-h-44 border rounded bg-white dark:bg-gray-900 p-2">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">P/L</th>
                  <th className="px-3 py-2">P/L %</th>
                </tr>
              </thead>
              <tbody>
                {sampleOrders.map((order) => {
                  const pnl = calculatePnL(order);
                  const pnlPercentage = calculatePnLPercentage(order);
                  const pnlColor = pnl >= 0 ? 'text-green-500' : 'text-red-500';
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-1 font-mono">{order.symbol}</td>
                      <td className="px-3 py-1">{order.type}</td>
                      <td className="px-3 py-1">{order.quantity}</td>
                      <td className="px-3 py-1">${order.price}</td>
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
        </div>
        <div className="overflow-y-auto">
          <h3 className="font-bold mb-2">Portfolio</h3>
          <PortfolioPanel />
        </div>
      </div>
    </div>
  );
}