import React from "react";
import PortfolioPanel from "./PortfolioPanel";

export default function BottomPanel({ symbol }) {
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
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-1 font-mono">{symbol}</td>
                  <td className="px-3 py-1">BUY</td>
                  <td className="px-3 py-1">10</td>
                  <td className="px-3 py-1">$195.40</td>
                  <td className="px-3 py-1 text-yellow-500">PENDING</td>
                </tr>
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
