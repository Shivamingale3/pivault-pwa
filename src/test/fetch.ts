import type { MockInstance } from "vitest";

type FetchSpy = MockInstance<typeof fetch>;

/** The URL of the n-th `fetch` call. `postJson` always passes a `URL` object. */
export const calledUrl = (spy: FetchSpy, call = 0): string => {
  const [input] = spy.mock.calls[call] ?? [];
  if (!(input instanceof URL)) throw new Error("fetch was not called with a URL");
  return input.href;
};

/** The init argument of the n-th `fetch` call. */
export const calledInit = (spy: FetchSpy, call = 0): RequestInit => spy.mock.calls[call]?.[1] ?? {};
