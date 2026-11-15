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

/**
 * POSTs as the signed-in user: sends the session token and a fresh signature made with this
 * device's non-extractable login key, so a stolen token alone is useless. Throws a 401 `ApiError`
 * when there is no session or key on this device.
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
  const timestamp = String(Date.now());
  const payload = signaturePayload(timestamp, "POST", `${API_PREFIX}${path}`);
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
    },
  });
}
