import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SECRET_CLIPBOARD_MS, copySecret } from "@/utils/clipboard.utils";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});
afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("copySecret", () => {
  it("copies, then overwrites the clipboard with nothing after the delay", async () => {
    await expect(copySecret("s3cret")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("s3cret");
    vi.advanceTimersByTime(SECRET_CLIPBOARD_MS - 1);
    expect(writeText).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(writeText).toHaveBeenLastCalledWith("");
  });

  it("reports failure, and schedules nothing, when the browser refuses", async () => {
    writeText.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    await expect(copySecret("s3cret")).resolves.toBe(false);
    vi.advanceTimersByTime(SECRET_CLIPBOARD_MS * 2);
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
