import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { auth } from "../utils/firebase";

export default function AccountPanel({ open, onClose }) {
  const { user, logout } = useAuth();

  // Local state for profile form
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Local state for password form
  const [password, setPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  // For email verification
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  // Sync with user displayName if user changes externally
  useEffect(() => {
    setDisplayName(user?.displayName || "");
  }, [user]);

  // Save profile display name
  async function saveProfile(e) {
    e.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setProfileMessage("Profile updated!");
    } catch (error) {
      setProfileMessage(error.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Send email verification
  async function sendVerification() {
    setVerificationMessage("");
    setVerificationSending(true);
    try {
      await sendEmailVerification(user);
      setVerificationMessage("Verification email sent!");
    } catch (error) {
      setVerificationMessage(
        error.message || "Failed to send verification email."
      );
    } finally {
      setVerificationSending(false);
    }
  }

  // Change password
  async function changePassword(e) {
    e.preventDefault();
    setPwMessage("");
    if (!password.trim()) {
      setPwMessage("Please enter a new password.");
      return;
    }
    setPwSaving(true);
    try {
      await updatePassword(user, password);
      setPwMessage("Password updated!");
      setPassword("");
    } catch (error) {
      setPwMessage(error.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-panel-title"
    >
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow min-w-[350px] relative">
        <button
          className="absolute top-2 right-4 text-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          onClick={onClose}
          aria-label="Close profile and settings panel"
          type="button"
        >
          &times;
        </button>

        <h2
          id="account-panel-title"
          className="text-xl mb-4 font-bold text-gray-900 dark:text-gray-100"
        >
          Profile & Settings
        </h2>

        {/* Profile Form */}
        <form onSubmit={saveProfile} className="mb-3">
          <label
            className="block mb-2 text-gray-700 dark:text-gray-300"
            htmlFor="display-name"
          >
            Display name
          </label>
          <input
            id="display-name"
            className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={savingProfile}
            type="text"
            name="displayName"
            placeholder="Your display name"
            autoComplete="name"
          />
          <label
            className="block mt-4 mb-2 text-gray-700 dark:text-gray-300"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            className="w-full px-2 py-1 rounded border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 cursor-not-allowed"
            value={user.email}
            disabled
            type="email"
            name="email"
            autoComplete="email"
          />
          {!user.emailVerified && (
            <button
              type="button"
              onClick={sendVerification}
              disabled={verificationSending}
              className="mt-1 text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none"
              aria-label="Send email verification"
            >
              {verificationSending ? "Sending..." : "Verify email"}
            </button>
          )}
          {verificationMessage && (
            <div className="mt-1 text-xs text-green-600">
              {verificationMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className={`w-full mt-4 py-1 rounded text-white ${
              savingProfile
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {savingProfile ? "Saving..." : "Save"}
          </button>
          {profileMessage && (
            <div className="mt-2 text-sm text-green-600">{profileMessage}</div>
          )}
        </form>

        {/* Password Change Form */}
        <form onSubmit={changePassword} className="mb-2">
          <label
            className="block mb-1 text-gray-700 dark:text-gray-300"
            htmlFor="new-password"
          >
            Change password
          </label>
          <input
            id="new-password"
            className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            name="password"
            disabled={pwSaving}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={pwSaving}
            className={`w-full mt-2 py-1 rounded text-white ${
              pwSaving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-900"
            } transition-colors`}
          >
            {pwSaving ? "Changing..." : "Change Password"}
          </button>
          {pwMessage && (
            <div className="mt-1 text-sm text-green-600">{pwMessage}</div>
          )}
        </form>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Last login: {user.metadata?.lastSignInTime || "Unknown"}
        </div>

        <button
          type="button"
          className="text-red-600 mt-3 underline hover:text-red-700 focus:outline-none"
          onClick={logout}
          aria-label="Logout"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
