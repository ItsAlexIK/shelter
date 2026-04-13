const DB_NAME    = "ServerSentinel";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = (e) => {
      _db = e.target.result;
      _db.onclose = () => { _db = null; };
      resolve(_db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getSnap(guildId) {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(guildId);
      req.onsuccess = (e) => resolve(e.target.result ?? {});
      req.onerror   = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("[ServerSentinel] getSnap failed:", err);
    return {};
  }
}

export async function saveSnap(guildId, data) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(data, guildId);
      tx.oncomplete = resolve;
      tx.onerror    = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("[ServerSentinel] saveSnap failed:", err);
  }
}

export async function deleteSnap(guildId) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(guildId);
      tx.oncomplete = resolve;
      tx.onerror    = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("[ServerSentinel] deleteSnap failed:", err);
  }
}

export async function getAllSnaps() {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx      = db.transaction(STORE_NAME, "readonly");
      const os      = tx.objectStore(STORE_NAME);
      const result  = {};
      const reqKeys = os.getAllKeys();
      reqKeys.onsuccess = (e) => {
        const keys    = e.target.result;
        const reqVals = os.getAll();
        reqVals.onsuccess = (ev) => {
          ev.target.result.forEach((val, i) => { result[keys[i]] = val; });
          resolve(result);
        };
        reqVals.onerror = (ev) => reject(ev.target.error);
      };
      reqKeys.onerror = (ev) => reject(ev.target.error);
    });
  } catch (err) {
    console.error("[ServerSentinel] getAllSnaps failed:", err);
    return {};
  }
}