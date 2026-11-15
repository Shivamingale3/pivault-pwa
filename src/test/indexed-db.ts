import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach } from "vitest";
import { closeAuthDb } from "@/db/idb";

const install = (factory: IDBFactory | undefined) => {
  for (const target of [globalThis, window]) {
    Object.defineProperty(target, "indexedDB", {
      configurable: true,
      writable: true,
      value: factory,
    });
  }
};

/** Gives every test its own empty in-memory IndexedDB (real structured clone, so CryptoKeys work). */
export const freshIndexedDbPerTest = () => {
  beforeEach(() => {
    install(new IDBFactory());
  });
  afterEach(async () => {
    await closeAuthDb();
    install(undefined);
  });
};
