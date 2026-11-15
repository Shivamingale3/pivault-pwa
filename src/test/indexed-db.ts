import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { afterEach, beforeEach } from "vitest";
import { closeAuthDb } from "@/db/idb";
import { closeVaultDb } from "@/db/vault.db";

const install = (factory: IDBFactory | undefined) => {
  for (const target of [globalThis, window]) {
    Object.defineProperty(target, "indexedDB", {
      configurable: true,
      writable: true,
      value: factory,
    });
    Object.defineProperty(target, "IDBKeyRange", {
      configurable: true,
      writable: true,
      value: factory ? IDBKeyRange : undefined,
    });
  }
};

/** Gives every test its own empty in-memory IndexedDB (real structured clone, so CryptoKeys work). */
export const freshIndexedDbPerTest = () => {
  beforeEach(() => {
    install(new IDBFactory());
  });
  afterEach(async () => {
    await closeVaultDb();
    await closeAuthDb();
    install(undefined);
  });
};
