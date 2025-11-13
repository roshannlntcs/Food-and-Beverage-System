// src/pages/UserLoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaLock } from "react-icons/fa";
import { api, setToken } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const persistUserSession = (_user, token) => {
  setToken(token);
};

export default function UserLoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(event) {
    event?.preventDefault?.();
    const trimmedId = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId || !trimmedPassword) {
      setError("Please enter your School ID or Username and Password.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        password: trimmedPassword,
        schoolId: trimmedId,
        username: trimmedId,
      };

      const { token, user } = await api("/auth/login", "POST", payload);
      persistUserSession(user, token);
      if (auth?.setCurrentUser) auth.setCurrentUser(user);
      if (auth?.refreshCurrentUser) auth.refreshCurrentUser();
      navigate("/roles");
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center md:justify-start px-6 md:px-24"
      style={{ backgroundImage: "url('/userlogin_bg.png')" }}
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl w-full max-w-md p-8 md:p-10 space-y-8 md:mr-auto">
        <div className="flex flex-col items-center space-y-3 text-center">
          <img src="/poslogo.png" alt="POS Logo" className="h-16 w-auto" />
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-sm text-gray-600">
            Sign in with your campus credentials to continue.
          </p>
        </div>

        {error ? (
          <div
            className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School ID or Username
            </label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FFC72C]">
              <FaIdCard className="text-gray-500" />
              <input
                className="w-full outline-none text-sm"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your School ID"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FFC72C]">
              <FaLock className="text-gray-500" />
              <input
                className="w-full outline-none text-sm"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full bg-[#FFC72C] text-black font-semibold shadow hover:bg-[#ffb400] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full h-11 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

