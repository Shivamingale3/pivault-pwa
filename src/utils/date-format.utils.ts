/** "14 Mar 2024". */
export const formatDay = (epochMs: number): string =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    epochMs,
  );

/** "github.com" from "https://www.github.com/login"; an empty string when it isn't a web address. */
export function domainOf(url: string): string {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.hostname.replace(/^www\./, "")
      : "";
  } catch {
    return "";
  }
}
