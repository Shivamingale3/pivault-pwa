import type { SyncStats } from "@/schemas/sync.schema";

/**
 * `syncing`: talking to the server. `synced`: everything is up to date. `offline`: no connection,
 * changes wait on this device. `error`: the server refused something unexpected (retrying).
 * `ended`: the session is gone (signed in on another device), so syncing stopped.
 */
export type SyncStatus = "syncing" | "synced" | "offline" | "error" | "ended";

/** How far a pull has got: entries received so far, and in all (so far + still waiting). */
export interface SyncProgress {
  pulled: number;
  total: number;
}

export interface SyncState {
  status: SyncStatus;
  /** Set while a pull is running; null when idle. Drives "Rebuilding your vault". */
  progress: SyncProgress | null;
  /** A message safe to show, for `error` and `ended`. */
  error: string | null;
  stats: SyncStats;
}

export interface SyncContextValue extends SyncState {
  /** Syncs now. Resolves when this device and the server agree, or when it fails. */
  syncNow: () => Promise<void>;
}
