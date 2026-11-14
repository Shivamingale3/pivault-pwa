import { linkCompletedSchema, linkStatusSchema } from "@/schemas/password-link.schema";
import { postJson } from "@/services/api.client";
import type { LinkStatus } from "@/types/password-link.types";

const BASE = "/auth/password-links";

/** Asks the API whether an emailed link is still usable. Does not spend it. */
export const validateLink = (token: string, signal?: AbortSignal): Promise<LinkStatus> =>
  postJson(`${BASE}/validate`, { token }, linkStatusSchema, { signal });

/** Sets the password, verifies the email and spends the link, all in one step on the server. */
export const completeLink = async (
  token: string,
  password: string,
  signal?: AbortSignal,
): Promise<void> => {
  await postJson(`${BASE}/complete`, { token, password }, linkCompletedSchema, { signal });
};
