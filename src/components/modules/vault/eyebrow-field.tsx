import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface EyebrowFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url";
  autoFocus?: boolean;
  /** Replaces the plain input (the password field brings its own buttons). */
  children?: ReactNode;
}

/** A form field with a mono eyebrow label above it. */
export function EyebrowField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
  children,
}: EyebrowFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="px-1 text-eyebrow">
        {label}
      </label>
      {children ?? (
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize={type === "url" ? "none" : undefined}
          spellCheck={false}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      )}
    </div>
  );
}
