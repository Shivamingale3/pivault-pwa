import { describe, expect, it } from "vitest";
import { StoreName } from "@/constants/storage.constants";
import { idbClear, idbDelete, idbGet, idbPut } from "@/db/idb";
import { StorageErrorKind } from "@/enums/storage.enum";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

describe("idb wrapper", () => {
  describe("with IndexedDB", () => {
    freshIndexedDbPerTest();

    it("puts, gets, deletes and clears per store", async () => {
      await idbPut(StoreName.Auth, "a", { n: 1 });
      await idbPut(StoreName.Keys, "a", "other store");
      await expect(idbGet(StoreName.Auth, "a")).resolves.toEqual({ n: 1 });
      await idbDelete(StoreName.Auth, "a");
      await expect(idbGet(StoreName.Auth, "a")).resolves.toBeUndefined();
      await idbClear(StoreName.Keys);
      await expect(idbGet(StoreName.Keys, "a")).resolves.toBeUndefined();
    });

    it("wraps a failed write in a StorageError", async () => {
      await expect(idbPut(StoreName.Auth, "a", () => 1)).rejects.toMatchObject({
        kind: StorageErrorKind.Failed,
      });
    });
  });

  describe("without IndexedDB", () => {
    it("reports storage as unavailable", async () => {
      await expect(idbGet(StoreName.Auth, "a")).rejects.toMatchObject({
        kind: StorageErrorKind.Unavailable,
      });
    });
  });
});
