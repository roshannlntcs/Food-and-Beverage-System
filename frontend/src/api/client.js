// frontend/src/api/client.js
// CRA doesn't support import.meta.*. Use REACT_APP_API_URL for web builds,
// but prefer the Electron-provided origin when running inside the desktop shell.
const desktopOrigin =
  typeof window !== 'undefined' && window.desktop && window.desktop.backendOrigin
    ? window.desktop.backendOrigin
    : null;

const FALLBACK_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export const BASE_URL = (desktopOrigin || FALLBACK_BASE).replace(/\/$/, '');

let authToken = null;

export function setToken(token) {
  authToken = token || null;
}

export function clearToken() {
  authToken = null;
}

// Thin fetch wrapper that prefers httpOnly cookie auth, but still supports
// an in-memory token for transitional flows (e.g. immediately after login).
export async function api(path, method = 'GET', body) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch (_err) {
      // ignore JSON parse issues
    }
    const message = payload?.error || `${res.status} ${res.statusText}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = payload;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}
