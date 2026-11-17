import { FingerprintIcon, ScanFaceIcon } from "lucide-react";

/** iPhones and iPads unlock with a face; most other phones with a fingerprint. Decorative. */
const isApple = (): boolean => /iPhone|iPad|iPod/.test(navigator.userAgent);

export function BiometricIcon({ className }: { className?: string }) {
  return isApple() ? (
    <ScanFaceIcon aria-hidden="true" className={className} />
  ) : (
    <FingerprintIcon aria-hidden="true" className={className} />
  );
}
