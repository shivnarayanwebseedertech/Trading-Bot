import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open, onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      login(email, password)
        .then(onClose)
        .catch((e) => setError(e.message));
    } else {
      signup(email, password)
        .then(onClose)
        .catch((e) => setError(e.message));
    }
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-xl min-w-[320px]">
        <h2 className="text-lg font-bold mb-3">
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
          />
          <input
            type="password"
            className="mb-2 w-full px-2 py-1 border rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-sm text-red-500 mb-1">{error}</div>}
          <button className="w-full bg-blue-700 text-white py-1 rounded">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
        <div className="mt-3 text-sm text-center">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-600"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button
                className="text-blue-600"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 text-lg"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
