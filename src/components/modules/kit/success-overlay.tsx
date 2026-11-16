import { CheckIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface SuccessOverlayProps {
  /** "Signed in", "Unlocked". */
  label: string;
  /** Called once after the confirmation has been seen. */
  onDone: () => void;
  durationMs?: number;
}

/** A brief full-screen confirmation on the dark surface: white check circle and a label. */
export function SuccessOverlay({ label, onDone, durationMs = 900 }: SuccessOverlayProps) {
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      done.current();
    }, durationMs);
    return () => {
      clearTimeout(timer);
    };
  }, [durationMs]);

  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex animate-rise flex-col items-center justify-center gap-5 bg-hero text-hero-foreground"
    >
      <span
        aria-hidden="true"
        className="flex size-17.5 items-center justify-center rounded-full bg-hero-foreground text-hero [&_svg]:size-8"
      >
        <CheckIcon strokeWidth={2.5} />
      </span>
      <p className="text-[1.4375rem] font-extrabold tracking-tight">{label}</p>
    </div>
  );
}
