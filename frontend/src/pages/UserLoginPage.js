import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function UserLoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const spliceLogo = "/splice_logo.png";
  const REMEMBER_KEY = "splice-remember-device";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedId = window.localStorage.getItem(REMEMBER_KEY);
      if (storedId) {
        setIdentifier(storedId);
        setRememberDevice(true);
      }
    } catch (err) {
      console.warn("Unable to load remembered device", err);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedId = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId || !trimmedPassword) {
      setError("Please enter your School ID or Username and Password.");
      return;
    }

    setError("");
    setBusy(true);
    try {
      const payload = {
        password: trimmedPassword,
        schoolId: trimmedId,
        username: trimmedId,
      };
      const { token, user } = await api("/auth/login", "POST", payload);
      setToken(token);
      if (auth?.setCurrentUser) auth.setCurrentUser(user);
      if (auth?.refreshCurrentUser) auth.refreshCurrentUser();
      try {
        if (rememberDevice) {
          window.localStorage.setItem(REMEMBER_KEY, trimmedId);
        } else {
          window.localStorage.removeItem(REMEMBER_KEY);
        }
      } catch (storageErr) {
        console.warn("Unable to persist remember device preference", storageErr);
      }
      navigate("/roles");
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ backgroundColor: "#7A0011", fontFamily: '"Inter", sans-serif' }}
    >
      <div className="w-[960px] max-w-full rounded-3xl shadow-2xl overflow-hidden bg-[#FFF4E1] flex flex-col md:flex-row">
        {/* Left: login */}
        <div className="w-full md:w-1/2 bg-white px-10 py-10 flex flex-col justify-between">
          <div>
            {/* Logo + title */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                style={{
                  background:
                    "radial-gradient(circle, #FFC94A 0%, #C21C2A 60%, #7A0011 100%)",
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <img
                    src={spliceLogo}
                    alt="Splice logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#3A1B1B]">
                  Splice F&amp;B System
                </h1>
                <p className="text-xs text-[#7C5C5C]">
                  POS | Inventory | Simulation
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#3A1B1B]">
                Welcome!
              </h2>
              <p className="text-sm text-[#7C5C5C]">
                Sign in with your campus credentials to continue.
              </p>
            </div>

            {error ? (
              <div
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1">
                <label
                  htmlFor="username"
                  className="text-xs font-medium text-[#7C5C5C]"
                >
                  School ID or Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E5EA] bg-white px-3 py-2.5 text-sm text-[#3A1B1B] focus:outline-none focus:ring-2 focus:ring-[#C21C2A]"
                  placeholder="e.g. superadmin"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-[#7C5C5C]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E5EA] bg-white px-3 py-2.5 text-sm text-[#3A1B1B] focus:outline-none focus:ring-2 focus:ring-[#C21C2A]"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#7C5C5C]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#CFAFAF] text-[#C21C2A] focus:ring-[#C21C2A]"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full py-2.5 text-sm font-semibold text-[#3A1B1B] shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C21C2A] disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, #FFC94A 0%, #C21C2A 100%)",
                  }}
                >
                  {busy ? "Signing in..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full rounded-full border border-[#D8C6C6] bg-white py-2.5 text-sm font-medium text-[#7C5C5C] hover:bg-[#FFF4E1]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-[11px] text-[#A07B7B]">
            For campus training use only.
          </p>
        </div>

        {/* Right: splice showcase */}
        <div className="hidden md:flex w-full md:w-1/2 relative items-center justify-start bg-gradient-to-br from-[#FFC94A] via-[#FFE7B0] to-[#C21C2A]">
          <div className="absolute left-0 top-0 h-full w-[2px] bg-white/30" />
          <div className="relative h-full w-full flex flex-col items-center justify-center gap-9 px-8 py-12 text-[#3A1B1B]">
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="w-36 h-36 rounded-full bg-transparent flex items-center justify-center shadow-[0_25px_55px_rgba(0,0,0,0.3)] ring-1 ring-white/50">
                <img
                  src="/splice_logo2.png"
                  alt="Splice emblem"
                  className="w-28 h-28 object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.25)]"
                />
              </div>
              <p className="text-[11px] tracking-[0.32em] text-black text-center">
                Login to switch roles between:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-7 w-full">
              <div className="flex flex-col items-center gap-4 text-center text-black">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide opacity-80">
                    Cashier
                  </span>
                  <span className="text-2xl font-semibold leading-tight">
                    POS
                  </span>
                  <span className="text-sm opacity-80">
                    Front counter
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/60 h-36 w-full">
                  <img
                    src="/cashierbg.png"
                    alt="Cashier view"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf4]/90 via-transparent to-transparent" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 text-center text-black">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide opacity-80">
                    Admin
                  </span>
                  <span className="text-2xl font-semibold leading-tight">
                    Inventory
                  </span>
                  <span className="text-sm opacity-80">
                    Stock rooms
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/60 h-36 w-full">
                  <img
                    src="/adminbg.png"
                    alt="Admin view"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf4]/90 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
