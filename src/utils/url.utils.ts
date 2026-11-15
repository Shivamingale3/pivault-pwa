/** The URL when it is a plain http(s) address, otherwise null, so we never link to javascript: or data: URLs. */
export const safeHttpUrl = (value: string): string | null => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};
