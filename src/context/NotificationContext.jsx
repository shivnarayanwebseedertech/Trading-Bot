import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  // Track timer IDs to clear if needed
  const timers = useRef(new Map());

  const addNotification = useCallback(
    (message, type = "info", timeout = 3000) => {
      const id = Date.now() + Math.random();
      setNotifications((notifications) => [
        ...notifications,
        { id, message, type },
      ]);

      if (timeout > 0) {
        const timerId = setTimeout(() => {
          setNotifications((notifications) =>
            notifications.filter((n) => n.id !== id)
          );
          timers.current.delete(id);
        }, timeout);
        timers.current.set(id, timerId);
      }
      return id; // You might want to return id if caller wants manual removal
    },
    []
  );

  const removeNotification = (id) => {
    setNotifications((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
    // Clear the timer if exists
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((timerId) => clearTimeout(timerId));
      timers.current.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
