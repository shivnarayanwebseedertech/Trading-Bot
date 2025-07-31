import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { auth } from "../utils/firebase";

export default function AccountPanel({ open, onClose }) {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    updateProfile(user, { displayName })
      .then(() => setMessage("Profile updated!"))
      .catch((e) => setMessage(e.message))
      .finally(() => setSaving(false));
  }

  function sendVerification() {
    sendEmailVerification(user).then(() =>
      setMessage("Verification email sent!")
    );
  }

  function changePassword(e) {
    e.preventDefault();
    setPwMsg("");
    updatePassword(user, pw)
      .then(() => setPwMsg("Password updated!"))
      .catch((e) => setPwMsg(e.message));
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow min-w-[350px]">
        <button className="absolute top-2 right-4 text-lg" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl mb-4 font-bold">Profile & Settings</h2>
        <form onSubmit={saveProfile} className="mb-3">
          <label className="block mb-2">
            <span className="text-sm">Display name</span>
            <input
              className="w-full px-2 py-1 mt-1 rounded border"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="block mb-2">
            <span className="text-sm">Email</span>
            <input
              className="w-full px-2 py-1 mt-1 rounded border bg-gray-100"
              value={user.email}
              disabled
            />
            {!user.emailVerified && (
              <button
                type="button"
                onClick={sendVerification}
                className="text-xs mt-1 text-blue-600 underline"
              >
                Verify email
              </button>
            )}
          </label>
          <button
            className="w-full bg-blue-600 text-white rounded mt-2 py-1"
            disabled={saving}
          >
            Save
          </button>
        </form>
        {message && (
          <div className="mb-2 text-green-600 text-sm">{message}</div>
        )}
        <form onSubmit={changePassword} className="mb-2">
          <label className="block mb-1">
            <span className="text-sm">Change password</span>
            <input
              className="w-full px-2 py-1 mt-1 rounded border"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="New password"
            />
          </label>
          <button className="w-full bg-blue-800 text-white rounded mt-2 py-1">
            Change Password
          </button>
          {pwMsg && <div className="mt-1 text-sm text-green-600">{pwMsg}</div>}
        </form>
        <div className="text-xs text-gray-500 mt-4">
          Last login: {user.metadata?.lastSignInTime}
        </div>
        <button className="text-red-600 mt-3 underline" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
