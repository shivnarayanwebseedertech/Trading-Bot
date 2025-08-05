import React, { useState } from "react";

export default function TradeActions({ symbol }) {
  const [status, setStatus] = useState("");
  async function handleBuy() {
    setStatus("Sending buy order...");
    await new Promise((r) => setTimeout(r, 600));
    setStatus(`Buy order placed for ${symbol}!`);
  }
  async function handleSell() {
    setStatus("Sending sell order...");
    await new Promise((r) => setTimeout(r, 600));
    setStatus(`Sell order placed for ${symbol}!`);
  }
  async function handleStrategy() {
    setStatus("Applying strategy...");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("Strategy applied! (buy/sell signals processed)");
  }
  return (
    <div className="flex flex-col items-center gap-2 mt-4 mb-2">
      <div className="flex justify-center gap-4">
        <button
          onClick={handleBuy}
          className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
          type="button"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
          type="button"
        >
          Sell
        </button>
        <button
          onClick={handleStrategy}
          className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
          type="button"
        >
          Apply Strategy
        </button>
      </div>
      {status && (
        <div
          className="text-sm mt-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"
          aria-live="polite"
        >
          {status}
        </div>
      )}
    </div>
  );
}
