import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = "info", timeout = 3000) => {
      const id = Date.now();
      setNotifications((notifications) => [
        ...notifications,
        { id, message, type },
      ]);
      if (timeout > 0) {
        setTimeout(() => {
          setNotifications((notifications) =>
            notifications.filter((n) => n.id !== id)
          );
        }, timeout);
      }
    },
    []
  );

  const removeNotification = (id) => {
    setNotifications((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
