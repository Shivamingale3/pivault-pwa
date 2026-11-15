/** True for PINs anyone tries first: one repeated digit (000000) or a straight run (123456, 654321). */
export const isWeakPin = (pin: string): boolean => {
  const digits = Array.from(pin, Number);
  const steps = digits.slice(1).map((digit, index) => digit - (digits[index] ?? digit));
  const first = steps[0];
  return first !== undefined && Math.abs(first) <= 1 && steps.every((step) => step === first);
};
