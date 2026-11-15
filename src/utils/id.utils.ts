import { monotonicFactory } from "ulid";

const generate = monotonicFactory();

/** ULID everywhere: unique ids that sort by creation, even for several created in one millisecond. */
export const newId = (): string => generate();
