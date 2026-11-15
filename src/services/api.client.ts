import type { z } from "zod";
import { env } from "@/config/env.config";
import { API_ERROR_MESSAGES, API_PREFIX, API_TIMEOUT_MS } from "@/constants/api.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { apiEnvelopeSchema } from "@/schemas/api.schema";
import { ApiError } from "@/services/api.error";

interface PostOptions {
  /** Lets the caller cancel, e.g. when its component unmounts. */
  signal?: AbortSignal;
  /** Extra request headers, e.g. the signed-session headers. */
  headers?: Record<string, string>;
}

const withTimeout = (signal?: AbortSignal): AbortSignal => {
  const timeout = AbortSignal.timeout(API_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
};

const toTransportError = (error: unknown, signal?: AbortSignal): ApiError => {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError(ApiErrorKind.Timeout, API_ERROR_MESSAGES.timeout, null, error);
  }
  if (signal?.aborted) throw error;
  return new ApiError(ApiErrorKind.Network, API_ERROR_MESSAGES.network, null, error);
};

const readEnvelope = async (response: Response) => {
  try {
    const parsed = apiEnvelopeSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/**
 * POSTs JSON to `/api<path>` and returns the envelope's `data`, checked against `schema`.
 * Sends no cookies and no referrer, never caches, and gives up after `API_TIMEOUT_MS`.
 * Throws `ApiError` for everything except a caller-requested abort.
 */
export async function postJson<S extends z.ZodType>(
  path: string,
  body: unknown,
  schema: S,
  { signal, headers }: PostOptions = {},
): Promise<z.output<S>> {
  const url = new URL(`${API_PREFIX}${path}`, env.VITE_API_BASE_URL);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      signal: withTimeout(signal),
    });
  } catch (error) {
    throw toTransportError(error, signal);
  }

  const envelope = await readEnvelope(response);
  if (!response.ok) {
    const message = envelope?.message ?? API_ERROR_MESSAGES.fallback;
    throw new ApiError(ApiErrorKind.Http, message, response.status);
  }
  const data = envelope?.success ? schema.safeParse(envelope.data) : null;
  if (!data?.success) {
    throw new ApiError(
      ApiErrorKind.InvalidResponse,
      API_ERROR_MESSAGES.invalidResponse,
      response.status,
    );
  }
  return data.data;
}
