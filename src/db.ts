/**
 * Persistência: IndexedDB (preferencial) com fallback automático
 * para localStorage caso o IndexedDB não esteja disponível.
 */
const DB_NAME = "lifehub-pro";
const STORE = "kv";
const KEY = "state";
const LS_KEY = "lifehub-pro-state";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const hasIDB = typeof indexedDB !== "undefined";

export async function loadState<T>(): Promise<T | null> {
  if (hasIDB) {
    try {
      const db = await openDB();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      /* cai para localStorage */
    }
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveState<T>(state: T): Promise<void> {
  if (hasIDB) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(state, KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return;
    } catch {
      /* cai para localStorage */
    }
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* armazenamento cheio ou indisponível */
  }
}

export async function clearState(): Promise<void> {
  if (hasIDB) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      /* ignora */
    }
  }
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignora */
  }
}
