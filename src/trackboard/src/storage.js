/**
 * Thin localStorage wrapper with JSON serialization.
 * Drop-in replacement for the Claude artifact window.storage API.
 * All methods are async so the call-site is identical and swapping
 * backends (IndexedDB, a real API, etc.) requires no changes.
 */

const PREFIX = "ctf:";

function key(k) {
  return `${PREFIX}${k}`;
}

export const store = {
  async get(k) {
    try {
      const raw = localStorage.getItem(key(k));
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async set(k, value) {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
      return true;
    } catch (err) {
      // Quota exceeded or private-browsing restriction
      console.error("[store] set failed:", err);
      return false;
    }
  },

  async remove(k) {
    try {
      localStorage.removeItem(key(k));
      return true;
    } catch {
      return false;
    }
  },

  async clear() {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(PREFIX)
      );
      keys.forEach((k) => localStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },
};
