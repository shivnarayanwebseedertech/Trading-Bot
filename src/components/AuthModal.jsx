import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open, onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setEmail("");
      setPassword("");
      onClose();
    } catch (e) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-xl min-w-[320px] relative">
        <h2 id="auth-modal-title" className="text-lg font-bold mb-3">
          {mode === "login" ? "Sign In" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="mb-2 w-full px-2 py-1 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            aria-label="Email"
          />
          <input
            type="password"
            className="mb-2 w-full px-2 py-1 border rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            aria-label="Password"
          />
          {error && <div className="text-sm text-red-500 mb-1">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-1 rounded disabled:opacity-60"
            disabled={loading}
            aria-label={mode === "login" ? "Login" : "Create account"}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
        <div className="mt-3 text-sm text-center">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setMode("signup")}
                type="button"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
            </>
          )}
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 text-lg hover:text-gray-700 focus:outline-none"
          onClick={onClose}
          aria-label="Close authentication modal"
          type="button"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
