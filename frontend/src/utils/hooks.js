// src/utils/hooks.js
import { useState, useEffect } from "react";

// 🔁 Local storage hook
export function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}

// 🆔 ID generator factory
export function useIdGenerator(prefix) {
  return () => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
