import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  updateCurrentUser,
  changePassword as changePasswordApi,
} from "../api/profile";
import { api, clearToken } from "../api/client";

const CURRENT_USER_CACHE_KEY = "__posCurrentUser";

const getStorageHandles = () => {
  if (typeof window === "undefined") return [];
  const handles = [];
  try {
    if (window.sessionStorage) handles.push(window.sessionStorage);
  } catch (_err) {
    // ignore access issues
  }
  try {
    if (window.localStorage) handles.push(window.localStorage);
  } catch (_err) {
    // ignore access issues
  }
  return handles;
};

const readCachedCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const stores = getStorageHandles();
    for (const store of stores) {
      try {
        const raw = store.getItem(CURRENT_USER_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            return parsed;
          }
        }
      } catch (_err) {
        // ignore parsing/storage errors per store
      }
    }
  } catch (err) {
    console.warn("AuthContext: failed to read cached user", err);
  }
  return null;
};

const persistCachedCurrentUser = (user) => {
  if (typeof window === "undefined") return;
  try {
    const stores = getStorageHandles();
    const payload = user ? JSON.stringify(user) : null;
    stores.forEach((store) => {
      try {
        if (!payload) {
          store.removeItem(CURRENT_USER_CACHE_KEY);
        } else {
          store.setItem(CURRENT_USER_CACHE_KEY, payload);
        }
      } catch (_err) {
        // ignore quota/storage exceptions
      }
    });
  } catch (err) {
    console.warn("AuthContext: failed to persist cached user", err);
  }
};

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readCachedCurrentUser());
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const refreshCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      if (err?.status === 401) {
        setCurrentUser(null);
        setError(null);
      } else {
        console.error("refreshCurrentUser failed:", err);
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  const updateProfile = useCallback(
    async (payload = {}) => {
      const user = await updateCurrentUser(payload);
      if (user) {
        setCurrentUser(user);
      }
      return user;
    },
    []
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      const current = String(currentPassword || "").trim();
      const next = String(newPassword || "").trim();
      if (!current || !next) {
        throw new Error("Current and new password are required");
      }
      await changePasswordApi({ currentPassword: current, newPassword: next });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", "POST");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Logout request failed:", err);
    } finally {
      clearToken();
      setCurrentUser(null);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      refreshCurrentUser().catch(() => {});
    }
  }, [loaded, refreshCurrentUser]);

  useEffect(() => {
    persistCachedCurrentUser(currentUser);
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      refreshCurrentUser,
      updateProfile,
      changePassword,
      logout,
      authLoading: loading,
      authLoaded: loaded,
      authError: error,
    }),
    [
      currentUser,
      loading,
      loaded,
      error,
      refreshCurrentUser,
      updateProfile,
      changePassword,
      logout,
    ]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
