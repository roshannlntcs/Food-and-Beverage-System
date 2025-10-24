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

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
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
