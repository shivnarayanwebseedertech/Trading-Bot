import React, { useEffect, useState } from "react";

function formatDate(rawDate) {
  try {
    return new Date(rawDate).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return rawDate;
  }
}

/**
 * NewsFeed component fetches and displays stock-related news for a given symbol.
 * Utilizes FinancialModelingPrep free API for demo purposes.
 * Replace `apikey` with your own key for production.
 */
export default function NewsFeed({ symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError("");

    fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${encodeURIComponent(
        symbol
      )}&limit=10&apikey=demo` // TODO: Replace 'demo' with your API key from env vars
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch news:", err);
        setError("Failed to load news.");
        setNews([]);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading)
    return <div className="text-sm text-gray-400">Loading news…</div>;

  if (error)
    return <div className="text-sm text-red-500 font-semibold">{error}</div>;

  if (!news.length)
    return <div className="text-sm text-gray-400">No news found.</div>;

  return (
    <ul className="space-y-2">
      {news.map((item, idx) => (
        <li key={idx} className="text-xs border-b pb-2 mb-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
            title={item.title}
          >
            {item.title}
          </a>
          <div className="text-gray-500 mt-0.5">
            {formatDate(item.publishedDate || item.date)}
          </div>
        </li>
      ))}
    </ul>
  );
}
