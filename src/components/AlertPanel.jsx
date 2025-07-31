import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

const INDICATOR_OPTIONS = [
  { label: "Price", value: "price" },
  { label: "RSI", value: "rsi" },
  { label: "MACD", value: "macd" },
  // Add more indicators here as needed
];

export default function AlertPanel({ symbol, chartData, indicatorsData }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [alertType, setAlertType] = useState("price");
  const [repeat, setRepeat] = useState(false);
  const [error, setError] = useState("");

  // Default snooze time: 10 minutes
  const defaultSnoozeMs = 10 * 60 * 1000;

  // Listen for current user's alerts for the active symbol from Firestore
  useEffect(() => {
    if (!user) return setAlerts([]);
    const alertsCollection = collection(db, "users", user.uid, "alerts");
    const unsub = onSnapshot(alertsCollection, (snap) => {
      setAlerts(
        snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((a) => a.symbol === symbol)
      );
    });
    return () => unsub();
  }, [user, symbol]);

  // Validate numeric input
  function validateInputValue(val) {
    const num = Number(val);
    return !isNaN(num);
  }

  // Add new alert to Firestore
  async function addAlert(e) {
    e.preventDefault();
    setError("");
    if (!inputValue || !user) return;

    if (!validateInputValue(inputValue)) {
      setError("Please enter a valid number.");
      return;
    }

    const val = Number(inputValue);

    // Avoid duplicate active alerts with same type and value
    if (
      alerts.some(
        (a) => a.value === val && a.condition === alertType && a.active
      )
    ) {
      setError(`An active alert on ${alertType} at this level already exists.`);
      return;
    }

    await addDoc(collection(db, "users", user.uid, "alerts"), {
      symbol,
      condition: alertType,
      value: val,
      active: true,
      triggered: false,
      repeat,
      snoozedUntil: null,
      created: Date.now(),
    });

    setInputValue("");
    setRepeat(false);
  }

  // Remove alert document
  async function removeAlert(id) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "alerts", id));
  }

  // Toggle active state
  async function toggleAlert(id, active) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "alerts", id), { active });
  }

  // Reset triggered alert
  async function resetAlert(id) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "alerts", id), {
      triggered: false,
      active: true,
      snoozedUntil: null,
    });
  }

  // Snooze alert for the given duration
  async function snoozeAlert(id, durationMs = defaultSnoozeMs) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "alerts", id), {
      snoozedUntil: Date.now() + durationMs,
      active: false,
    });
  }

  // Get latest indicator values from passed indicatorsData prop
  const latestIndicators = useMemo(() => {
    if (!indicatorsData || indicatorsData.length === 0) return {};
    return indicatorsData[indicatorsData.length - 1] || {};
  }, [indicatorsData]);

  // Effect: auto-trigger alerts based on latest values
  useEffect(() => {
    if (!user || alerts.length === 0) return;

    alerts.forEach(async (a) => {
      // Skip if inactive, already triggered or snoozed
      if (
        !a.active ||
        a.triggered ||
        (a.snoozedUntil && a.snoozedUntil > Date.now())
      )
        return;

      let currentVal;
      if (a.condition === "price") {
        if (!chartData || chartData.length === 0) return;
        currentVal = chartData[chartData.length - 1].close;
      } else {
        currentVal = latestIndicators[a.condition];
      }
      if (currentVal === undefined || currentVal === null) return;

      // Trigger alert if condition met
      if (currentVal >= a.value) {
        // Browser notification permission check & fallback alert
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(
            `Alert: ${symbol} ${a.condition.toUpperCase()} ≥ ${a.value}`,
            {
              body: `Current value: ${currentVal.toFixed(2)}`,
            }
          );
        } else {
          alert(`ALERT: ${symbol} ${a.condition.toUpperCase()} ≥ ${a.value}`);
        }

        if (a.repeat) {
          // If repeat enabled, snooze alert rather than deactivate fully
          await updateDoc(doc(db, "users", user.uid, "alerts", a.id), {
            snoozedUntil: Date.now() + defaultSnoozeMs,
            active: false,
          });
        } else {
          // Mark triggered and deactivate alert
          await updateDoc(doc(db, "users", user.uid, "alerts", a.id), {
            triggered: true,
            active: false,
          });
        }
      }
    });
  }, [alerts, chartData, latestIndicators, symbol, user]);

  return (
    <div className="p-3 border rounded bg-blue-50 dark:bg-gray-900 mb-6 max-w-xl">
      <form className="mb-3 flex items-center gap-2" onSubmit={addAlert}>
        <select
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
          className="rounded border px-2 py-1 text-sm bg-white dark:bg-gray-800"
          aria-label="Select alert type"
        >
          {INDICATOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="any"
          value={inputValue}
          placeholder={`Alert value (${alertType})`}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-2 py-1 rounded border text-sm flex-1 bg-white dark:bg-gray-800"
          aria-label="Alert value"
          required
        />
        <label className="flex items-center space-x-1 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="form-checkbox h-4 w-4"
            aria-label="Repeat alert"
          />
          <span>Repeat</span>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
          aria-label="Add alert"
        >
          Add Alert
        </button>
      </form>
      {error && (
        <div className="mb-2 px-2 py-1 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      <ul>
        {alerts.length === 0 && (
          <li className="text-sm text-gray-500">
            No alerts set for <b>{symbol}</b>.
          </li>
        )}
        {alerts.map((a) => {
          const isSnoozed = a.snoozedUntil && a.snoozedUntil > Date.now();
          const snoozeRemaining = isSnoozed
            ? Math.max(0, a.snoozedUntil - Date.now())
            : 0;
          const snoozeMinutes = Math.floor(snoozeRemaining / 60000);
          const snoozeSeconds = Math.floor((snoozeRemaining % 60000) / 1000);

          return (
            <li
              key={a.id}
              className="flex items-center justify-between mb-1 text-sm py-1"
            >
              <span>
                <span
                  className={`mr-2 inline-block w-2 h-2 rounded-full ${
                    a.active
                      ? "bg-green-500"
                      : a.triggered
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                ></span>
                {a.condition.toUpperCase()} &ge; <b>{a.value}</b>{" "}
                {a.triggered && (
                  <span className="ml-2 px-2 rounded text-xs bg-green-100 text-green-600">
                    ✔ triggered
                  </span>
                )}
                {!a.active && !a.triggered && !isSnoozed && (
                  <span className="ml-2 px-2 rounded text-xs bg-yellow-100 text-yellow-700">
                    paused
                  </span>
                )}
                {isSnoozed && (
                  <span className="ml-2 px-2 rounded text-xs bg-orange-100 text-orange-700">
                    Snoozed {snoozeMinutes}m {snoozeSeconds}s
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {a.triggered ? (
                  <button
                    className="text-xs underline text-blue-600"
                    onClick={() => resetAlert(a.id)}
                    title="Reset alert"
                  >
                    Reset
                  </button>
                ) : (
                  <>
                    {!isSnoozed && (
                      <button
                        onClick={() => toggleAlert(a.id, !a.active)}
                        className="text-xs underline"
                        title={a.active ? "Pause alert" : "Activate alert"}
                      >
                        {a.active ? "Pause" : "Activate"}
                      </button>
                    )}
                    {isSnoozed && (
                      <button
                        onClick={() => toggleAlert(a.id, true)}
                        className="text-xs underline"
                        title="Reactivate alert now"
                      >
                        Reactivate
                      </button>
                    )}
                    {!isSnoozed && (
                      <button
                        onClick={() => snoozeAlert(a.id)}
                        className="text-xs underline text-orange-600"
                        title="Snooze alert for 10 minutes"
                      >
                        Snooze
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => removeAlert(a.id)}
                  className="text-xs text-red-500 underline"
                  title="Delete alert"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
