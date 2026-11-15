import {
  AUTH_DB_NAME,
  AUTH_DB_VERSION,
  STORAGE_ERROR_MESSAGES,
  StoreName,
} from "@/constants/storage.constants";
import { StorageErrorKind } from "@/enums/storage.enum";
import { StorageError } from "@/services/storage.error";

let connection: Promise<IDBDatabase> | null = null;

const toError = (reason: unknown): Error =>
  reason instanceof Error ? reason : new Error("IndexedDB request failed");

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(toError(request.error));
    };
  });

const unavailable = (cause?: unknown) =>
  new StorageError(StorageErrorKind.Unavailable, STORAGE_ERROR_MESSAGES.unavailable, cause);

const open = (): Promise<IDBDatabase> => {
  if (typeof globalThis.indexedDB === "undefined") return Promise.reject(unavailable());
  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(AUTH_DB_NAME, AUTH_DB_VERSION);
    request.onupgradeneeded = () => {
      for (const name of Object.values(StoreName)) {
        if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
      }
    };
    request.onsuccess = () => {
      // Another tab upgrading or the browser reclaiming storage: reconnect on the next call.
      request.result.onversionchange = () => {
        request.result.close();
        connection = null;
      };
      request.result.onclose = () => {
        connection = null;
      };
      resolve(request.result);
    };
    request.onerror = () => {
      reject(unavailable(request.error));
    };
  });
};

const getConnection = (): Promise<IDBDatabase> => {
  connection ??= open().catch((error: unknown) => {
    connection = null;
    throw error;
  });
  return connection;
};

const run = async <T>(
  store: StoreName,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await getConnection();
  try {
    const transaction = db.transaction(store, mode);
    const result = requestToPromise(action(transaction.objectStore(store)));
    if (mode === "readonly") return await result;
    // A write only counts once the transaction has committed.
    const committed = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(toError(transaction.error));
      };
      transaction.onabort = () => {
        reject(toError(transaction.error));
      };
    });
    const [value] = await Promise.all([result, committed]);
    return value;
  } catch (error) {
    throw new StorageError(StorageErrorKind.Failed, STORAGE_ERROR_MESSAGES.failed, error);
  }
};

export const idbGet = (store: StoreName, key: string): Promise<unknown> =>
  run(store, "readonly", (s) => s.get(key));

export const idbPut = async (store: StoreName, key: string, value: unknown): Promise<void> => {
  await run(store, "readwrite", (s) => s.put(value, key));
};

export const idbDelete = async (store: StoreName, key: string): Promise<void> => {
  await run(store, "readwrite", (s) => s.delete(key));
};

export const idbClear = async (store: StoreName): Promise<void> => {
  await run(store, "readwrite", (s) => s.clear());
};

/** Closes the cached connection (tests, or before deleting the database). */
export const closeAuthDb = async (): Promise<void> => {
  const current = connection;
  connection = null;
  if (current) (await current.catch(() => null))?.close();
};
