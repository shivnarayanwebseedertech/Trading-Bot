import React, { useState } from "react";

export default function TradeActions({ symbol }) {
  const [status, setStatus] = useState("");

  // Placeholder: replace with actual API call for placing a buy order.
  async function handleBuy() {
    setStatus("Sending buy order...");
    try {
      // TODO: Replace with your real backend API integration.
      // Example:
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ symbol, side: 'buy', quantity: 1 /* etc */ }),
      // });
      // const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStatus(`Buy order placed for ${symbol}!`);
    } catch (error) {
      setStatus(`Order failed: ${error.message || error}`);
    }
  }

  // Placeholder: replace with API call for sell order.
  async function handleSell() {
    setStatus("Sending sell order...");
    try {
      // TODO: Replace with your real backend API integration.
      // Example:
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ symbol, side: 'sell', quantity: 1 /* etc */ }),
      // });
      // const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStatus(`Sell order placed for ${symbol}!`);
    } catch (error) {
      setStatus(`Order failed: ${error.message || error}`);
    }
  }

  // Placeholder: replace with API call for applying strategy/backtest.
  async function handleStrategy() {
    setStatus("Applying strategy...");
    try {
      // TODO: Replace with your real backend or cloud function call.
      // Example:
      // const response = await fetch(`/api/strategy/run?symbol=${symbol}`);
      // const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setStatus("Strategy applied! (buy/sell signals processed)");
    } catch (error) {
      setStatus(`Strategy failed: ${error.message || error}`);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 mt-4 mb-2">
      <div className="flex justify-center gap-4">
        <button
          onClick={handleBuy}
          className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
          aria-label={`Buy ${symbol}`}
          type="button"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
          aria-label={`Sell ${symbol}`}
          type="button"
        >
          Sell
        </button>
        <button
          onClick={handleStrategy}
          className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
          aria-label={`Apply strategy for ${symbol}`}
          type="button"
        >
          Apply Strategy
        </button>
      </div>
      {status && (
        <div
          className="text-sm mt-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"
          role="status"
          aria-live="polite"
        >
          {status}
        </div>
      )}
    </div>
  );
}
