// src/utils/images.js
import { BASE_URL } from "../api/client";

let CATALOG = {};
try {
  const ctx = require.context('../assets', true, /\.(png|jpe?g|svg|webp|gif)$/i);
  ctx.keys().forEach((key) => {
    const url = ctx(key);
    const clean = key.replace(/^\.\//, '');
    const lower = clean.toLowerCase();
    CATALOG[lower] = url;
    const file = lower.split('/').pop();
    if (file) CATALOG[file] = url;
    const base = file ? file.replace(/\.[^.]+$/, '') : '';
    if (base) CATALOG[base] = url;
  });
} catch (_e) {
  CATALOG = {};
}

function lookup(norm) {
  return (
    CATALOG[norm] ||
    CATALOG[`${norm}.png`] ||
    CATALOG[`${norm}.jpg`] ||
    CATALOG[`${norm}.jpeg`] ||
    CATALOG[`${norm}.webp`] ||
    CATALOG[`${norm}.gif`]
  );
}

const toAbsolute = (raw) => {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;

  if (raw.startsWith('/uploads/')) return `${BASE_URL}${raw}`;
  if (raw.startsWith('uploads/')) return `${BASE_URL}/${raw.replace(/^\/+/, '')}`;

  if (raw.startsWith('/storage/')) return `${BASE_URL}${raw}`;
  if (raw.startsWith('storage/')) return `${BASE_URL}/${raw.replace(/^\/+/, '')}`;

  if (raw.startsWith('/files/')) return `${BASE_URL}${raw}`;
  if (raw.startsWith('files/')) return `${BASE_URL}/${raw.replace(/^\/+/, '')}`;

  return null;
};

function slugify(s) {
  return String(s || '')
    .trim().toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getImage(nameOrPath, fallbackName) {
  const PLACEHOLDER =
    lookup('placeholder') ||
    '/placeholder.png';

  if (typeof nameOrPath === 'string' && nameOrPath.length) {
    const raw = nameOrPath.trim();
    if (!raw) return PLACEHOLDER;
    const lower = raw.toLowerCase();
    if (lower.startsWith('data:image') || lower.startsWith('blob:')) return raw;

    const absolute = toAbsolute(raw);
    if (absolute) return absolute;

    if (raw.startsWith('/')) {
      const base = raw.split('/').pop()?.toLowerCase() || '';
      const byBase = lookup(base.replace(/\.[^.]+$/, '')) || lookup(base);
      if (byBase) return byBase;
      return raw;
    }
  }

  if (typeof nameOrPath === 'string' && nameOrPath) {
    const norm = nameOrPath.replace(/^\/+/, '').toLowerCase();
    const absolute = toAbsolute(norm);
    if (absolute) return absolute;
    const hit =
      lookup(norm) ||
      lookup(norm.split('/').pop() || '') ||
      lookup((norm.split('/').pop() || '').replace(/\.[^.]+$/, ''));
    if (hit) return hit;
  }

  if (fallbackName) {
    const s = slugify(fallbackName);
    const guesses = [s, s.replace(/-/g, '_'), s.replace(/-/g, '')];
    for (const g of guesses) {
      const hit =
        lookup(g) ||
        lookup(`menu/${g}`) ||
        lookup(`items/${g}`);
      if (hit) return hit;
    }
  }

  return PLACEHOLDER;
}

export function getProductImg(product) {
  if (!product) return getImage();
  return getImage(product.image || product.imageUrl || '', product.name || '');
}

const images = new Proxy({}, {
  get(_t, prop) {
    if (prop === 'default' || prop === '__esModule') return undefined;
    return getImage(String(prop));
  },
  has() { return true; }
});
images.placeholder = getImage('placeholder.png');
export default images;
