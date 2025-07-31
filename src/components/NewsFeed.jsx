import React, { useEffect, useState } from "react";

// This uses the 'financialmodelingprep' free API for demonstration; you can switch to any news API you prefer.
export default function NewsFeed({ symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    // Example: Free API, limited headlines. Replace 'demo' with your token for more.
    fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=demo`
    )
      .then((res) => res.json())
      .then((data) => setNews(data ?? []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading)
    return <div className="text-sm text-gray-400">Loading news…</div>;
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
          >
            {item.title}
          </a>
          <div className="text-gray-500 mt-0.5">{item.publishedDate}</div>
        </li>
      ))}
    </ul>
  );
}
