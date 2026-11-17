import type { z } from "zod";
import { API_PREFIX } from "@/constants/api.constants";
import { SESSION_MISSING_MESSAGE, signaturePayload } from "@/constants/auth.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { postJson } from "@/services/api.client";
import { ApiError } from "@/services/api.error";
import { loadLoginKeyPair } from "@/services/key-store.service";
import { loadSession } from "@/services/session.service";
import { bytesToBase64Url } from "@/utils/bytes.utils";

const HTTP_UNAUTHORIZED = 401;

/** A phone clock this far from the server's is corrected instead of failing the request. */
const CLOCK_TOLERANCE_MS = 30_000;
/** How far the server's clock is ahead of this device's, once learned. Memory only. */
let clockOffsetMs = 0;

/** For tests. */
export const resetClockOffset = (): void => {
  clockOffsetMs = 0;
};

/**
 * POSTs as the signed-in user: sends the session token and a fresh signature made with this
 * device's non-extractable login key over the method, path and body, so a stolen token alone is
 * useless and the body can't be swapped on the way. Throws a 401 `ApiError` when there is no
 * session or key on this device.
 *
 * The server only accepts timestamps close to its own clock. A phone whose clock is wrong would
 * get a 401 that looks like a lost session, so on a 401 the server's `Date` is compared with the
 * timestamp sent: if they are far apart the offset is remembered and the request retried once.
 */
export async function postSigned<S extends z.ZodType>(
  path: string,
  body: unknown,
  schema: S,
  { signal }: { signal?: AbortSignal } = {},
): Promise<z.output<S>> {
  const [session, pair] = await Promise.all([loadSession(), loadLoginKeyPair()]);
  if (!session || !pair) {
    throw new ApiError(ApiErrorKind.Http, SESSION_MISSING_MESSAGE, HTTP_UNAUTHORIZED);
  }
  // The same text `postJson` sends: the server hashes the bytes it receives and compares.
  const bodyHash = bytesToBase64Url(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(body))),
    ),
  );
  const send = async (sentAt: number) => {
    const timestamp = String(sentAt);
    const payload = signaturePayload(timestamp, "POST", `${API_PREFIX}${path}`, bodyHash);
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      pair.privateKey,
      new TextEncoder().encode(payload),
    );
    return postJson(path, body, schema, {
      signal,
      headers: {
        Authorization: `Bearer ${session.token}`,
        "X-Timestamp": timestamp,
        "X-Signature": bytesToBase64Url(new Uint8Array(signature)),
        "X-Body-SHA256": bodyHash,
      },
    });
  };

  const sentAt = Date.now() + clockOffsetMs;
  try {
    return await send(sentAt);
  } catch (error) {
    const serverTime =
      error instanceof ApiError && error.status === HTTP_UNAUTHORIZED ? error.serverTime : null;
    if (serverTime === null || Math.abs(serverTime - sentAt) <= CLOCK_TOLERANCE_MS) throw error;
    clockOffsetMs = serverTime - Date.now();
    return send(Date.now() + clockOffsetMs);
  }
}
