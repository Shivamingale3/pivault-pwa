interface FormErrorBannerProps {
  message: string | null;
}

/** Inline form error (design: destructive surface, polite live region, shakes when it appears). */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
  return (
    <div role="status" aria-live="polite">
      {message && (
        <p
          key={message}
          className="flex animate-shake items-start gap-2.5 rounded-md bg-destructive-surface px-3.25 py-2.75 text-xs font-semibold text-destructive-foreground"
        >
          <span
            aria-hidden="true"
            className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[0.625rem] font-extrabold text-primary-foreground"
          >
            !
          </span>
          {message}
        </p>
      )}
    </div>
  );
}
