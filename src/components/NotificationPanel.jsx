import React from "react";
import { useNotification } from "../context/NotificationContext";

export default function NotificationPanel() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-xs">
      {notifications.map(({ id, message, type }) => (
        <div
          key={id}
          className={`p-3 rounded shadow-lg text-white ${
            type === "info"
              ? "bg-blue-600"
              : type === "success"
              ? "bg-green-600"
              : type === "warning"
              ? "bg-yellow-600 text-black"
              : type === "error"
              ? "bg-red-600"
              : "bg-gray-600"
          } flex justify-between items-center`}
        >
          <div>{message}</div>
          <button
            className="ml-3 font-bold text-xl leading-none focus:outline-none"
            onClick={() => removeNotification(id)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
