/** 312_000_000 -> "312 MB", 1_500_000_000 -> "1.5 GB", 400_000 -> "0.4 MB". */
export function formatBytes(bytes: number): string {
  const megabytes = bytes / 1_000_000;
  if (megabytes >= 1000) return `${(megabytes / 1000).toFixed(1)} GB`;
  if (megabytes >= 10) return `${String(Math.round(megabytes))} MB`;
  return `${megabytes.toFixed(1)} MB`;
}
