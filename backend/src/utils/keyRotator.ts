import { ENV } from '../config/env.js';

let activeKeyIndex = 0;

/**
 * Returns all configured Gemini API keys, starting from the current active key.
 */
export function getRotatedKeys(): string[] {
  const allKeys = ENV.GEMINI_KEYS;
  if (!allKeys || allKeys.length === 0) return [];

  const rotated: string[] = [];
  for (let i = 0; i < allKeys.length; i++) {
    const idx = (activeKeyIndex + i) % allKeys.length;
    rotated.push(allKeys[idx]);
  }
  return rotated;
}

/**
 * Automatically advances activeKeyIndex to the next key when a key's quota is exhausted (429).
 */
export function markKeyQuotaExceeded(apiKey: string): void {
  const allKeys = ENV.GEMINI_KEYS;
  const idx = allKeys.indexOf(apiKey);
  if (idx !== -1 && idx === activeKeyIndex) {
    const prevKey = allKeys[activeKeyIndex];
    activeKeyIndex = (activeKeyIndex + 1) % allKeys.length;
    const nextKey = allKeys[activeKeyIndex];
    console.warn(`⚡ [Gemini Key Rotator] Key (${prevKey.substring(0, 12)}...) quota exhausted (429). Switched active key index to key #${activeKeyIndex + 1} (${nextKey.substring(0, 12)}...)`);
  }
}
