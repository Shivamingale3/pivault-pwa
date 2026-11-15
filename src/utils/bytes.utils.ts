export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

/** Expects an even-length hex string; callers validate with `parseRecoveryKey` first. */
export const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export const bytesToBase64 = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));

/** URL-safe base64 without padding: the form the API expects for the device public key. */
export const bytesToBase64Url = (bytes: Uint8Array): string =>
  bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");

export const base64UrlToBytes = (value: string): Uint8Array<ArrayBuffer> =>
  base64ToBytes(
    value
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(value.length / 4) * 4, "="),
  );

export const base64ToBytes = (value: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

/** Compares without stopping at the first difference, so timing doesn't leak how much matched. */
export const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
};
