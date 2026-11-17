import { afterEach, describe, expect, it, vi } from "vitest";
import { keepStorage } from "@/utils/storage.utils";

const install = (storage: unknown) => {
  Object.defineProperty(navigator, "storage", { configurable: true, value: storage });
};
afterEach(() => Reflect.deleteProperty(navigator, "storage"));

describe("keepStorage", () => {
  it("asks once, and not again when storage is already kept", async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    install({ persisted: () => Promise.resolve(false), persist });
    await expect(keepStorage()).resolves.toBe(true);
    expect(persist).toHaveBeenCalledOnce();

    install({ persisted: () => Promise.resolve(true), persist });
    await expect(keepStorage()).resolves.toBe(true);
    expect(persist).toHaveBeenCalledOnce();
  });

  it("is false, without throwing, when refused, unsupported or broken", async () => {
    install({ persisted: () => Promise.resolve(false), persist: () => Promise.resolve(false) });
    await expect(keepStorage()).resolves.toBe(false);
    install({});
    await expect(keepStorage()).resolves.toBe(false);
    install({
      persisted: () => Promise.reject(new Error("no")),
      persist: () => Promise.resolve(true),
    });
    await expect(keepStorage()).resolves.toBe(false);
  });
});
