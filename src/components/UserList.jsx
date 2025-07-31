import React, { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!import.meta.env.VITE_BACKEND_URL) {
      setError("Backend URL is not configured.");
      return;
    }

    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">
        User List (Dynamic from Backend)
      </h2>

      {loading && <p>Loading users...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <ul className="list-disc list-inside space-y-1">
          {users.length === 0 ? (
            <li>No users found.</li>
          ) : (
            users.map((user) => <li key={user._id}>{user.name}</li>)
          )}
        </ul>
      )}
    </div>
  );
}

export default UserList;
