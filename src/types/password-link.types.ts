import type { z } from "zod";
import type { linkStatusSchema } from "@/schemas/password-link.schema";

export type LinkStatus = z.output<typeof linkStatusSchema>;
