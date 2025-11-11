// src/utils/animationMemory.ts
/**
 * Veilige, SSR-proof animatiestatus met sessionStorage fallback.
 * Publieke API blijft identiek: hasPlayed, markPlayed, resetPlayed, clearAllPlayed.
 */

const PREFIX = "anim-played::";

// In-memory fallback als sessionStorage niet beschikbaar is
const mem = new Map<string, "1">();

function safeStore() {
  // SSR of geblokkeerde storage ⇒ fallback
  if (typeof window === "undefined") {
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: "1") => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
      keys: () => Array.from(mem.keys()),
    } as const;
  }
  try {
    // Proefschrijven om quota / privacy-modus te detecteren
    const testKey = "__anim_test__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return {
      getItem: (k: string) => window.sessionStorage.getItem(k),
      setItem: (k: string, v: "1") => window.sessionStorage.setItem(k, v),
      removeItem: (k: string) => window.sessionStorage.removeItem(k),
      keys: () => Object.keys(window.sessionStorage),
    } as const;
  } catch {
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: "1") => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
      keys: () => Array.from(mem.keys()),
    } as const;
  }
}

const store = safeStore();

const key = (id: string) => `${PREFIX}${id}`;

// Houd ids schoon en kort voor storage
function norm(id?: string): string | undefined {
  if (!id) return undefined;
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  // verwijder control chars en normaliseer spaties
  return trimmed.replace(/\s+/g, " ").slice(0, 300);
}

export function hasPlayed(id?: string): boolean {
  const n = norm(id);
  if (!n) return false;
  try {
    return store.getItem(key(n)) === "1";
  } catch {
    return false;
  }
}

export function markPlayed(id?: string): void {
  const n = norm(id);
  if (!n) return;
  try {
    store.setItem(key(n), "1");
  } catch {
    /* noop */
  }
}

export function resetPlayed(id?: string): void {
  const n = norm(id);
  if (!n) return;
  try {
    store.removeItem(key(n));
  } catch {
    /* noop */
  }
}

export function clearAllPlayed(): void {
  try {
    for (const k of store.keys()) {
      if (k.startsWith(PREFIX)) store.removeItem(k);
    }
  } catch {
    /* noop */
  }
}

// Exporteer prefix enkel indien je extern wilt filteren
export const ANIM_MEMORY_PREFIX = PREFIX;
