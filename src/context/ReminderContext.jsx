import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/apiClient";

const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   async function fetchReminders() {
  //     setLoading(true);
  //     try {
  //       const res = await api.get("/reminder");
  //       setReminders(res.data.data || []);
  //     } catch (e) {
  //       setReminders([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchReminders();
  // }, []);

  return (
    <ReminderContext.Provider value={{ reminders, loading }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  return useContext(ReminderContext);
} 