// src/utils/id.js

// Helper: generate exactly `digits` random digits (no leading zeros)
function randomNDigits(digits) {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** ORD-1XXXXXXX */
export function generateOrderID() {
  // “1” is the fixed first digit, randomNDigits(7) gives you 7 more digits
  return `ORD-1${randomNDigits(7)}`;
}

/** TRN-2XXXXXXX */
export function generateTransactionID() {
  return `TRN-2${randomNDigits(7)}`;
}

/** VOI-3XXXXXXX */
export function generateVoidID() {
  return `VOI-3${randomNDigits(7)}`;
}
