import React, { useState, useEffect } from "react";
import NewsFeed from "./NewsFeed";

export default function BottomPanel({ symbol }) {
  const [tab, setTab] = useState("news");

  return (
    <div className="bg-white dark:bg-gray-800 border-t mt-4 rounded-b-xl">
      <div className="flex p-2 border-b">
        <button
          className={tab === "news" ? "font-bold text-blue-600 mr-4" : "mr-4"}
          onClick={() => setTab("news")}
        >
          News
        </button>
        <button
          className={
            tab === "calendar" ? "font-bold text-blue-600 mr-4" : "mr-4"
          }
          onClick={() => setTab("calendar")}
        >
          Calendar
        </button>
        <button
          className={tab === "notes" ? "font-bold text-blue-600" : ""}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>
      </div>
      <div className="p-3 h-52 overflow-y-auto">
        {tab === "news" && <NewsFeed symbol={symbol} />}
        {tab === "calendar" && (
          <div className="text-gray-500 dark:text-gray-400">
            Calendar integration coming soon!
          </div>
        )}
        {tab === "notes" && <NotesSection symbol={symbol} />}
      </div>
    </div>
  );
}

// Simple persistent notes per symbol saved in localStorage
function NotesSection({ symbol }) {
  const key = "notes_" + symbol;
  const [notes, setNotes] = useState(() => localStorage.getItem(key) || "");

  useEffect(() => {
    setNotes(localStorage.getItem(key) || "");
  }, [symbol]);

  function handleChange(e) {
    setNotes(e.target.value);
    localStorage.setItem(key, e.target.value);
  }
  return (
    <textarea
      className="w-full h-40 rounded border px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      value={notes}
      onChange={handleChange}
      placeholder={`Your notes for ${symbol}...`}
      aria-label={`Notes for ${symbol}`}
    />
  );
}
