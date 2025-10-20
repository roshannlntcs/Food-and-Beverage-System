// src/utils/imageResolver.js
export function resolveImage(src) {
  // Accept absolute http(s), backend-served uploads, or public assets
  if (typeof src === 'string' && src.length) {
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/uploads/')) return src;     // served by backend
    if (src.startsWith('/')) return src;             // CRA public/
  }
  return '/placeholder.png'; // put a real placeholder under frontend/public/placeholder.png
}
