import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** The name (or email) the initial comes from. */
  name: string;
  className?: string;
}

/** The user's initial on an ink square. Decorative: the surrounding control carries the label. */
export function UserAvatar({ name, className }: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground",
        className,
      )}
    >
      {initial}
    </span>
  );
}
