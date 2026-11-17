import { useAvatarChoice, useAvatarUri } from "@/hooks/use-avatar";
import { cn } from "@/lib/utils";
import type { AvatarChoice } from "@/schemas/preferences.schema";

interface UserAvatarProps {
  /** The name (or email) the initial comes from. */
  name: string;
  className?: string;
  /** Shows this avatar instead of the user's own pick (the picker's previews). `null` forces the initial. */
  choice?: AvatarChoice | null;
}

/**
 * The user's picked avatar, or their initial on an ink square. Decorative: the surrounding control
 * carries the label.
 */
export function UserAvatar({ name, className, choice }: UserAvatarProps) {
  const own = useAvatarChoice();
  const shown = choice === undefined ? own : choice;
  const uri = useAvatarUri(shown);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const box = cn(
    "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg",
    className,
  );
  if (shown && uri) {
    return <img src={uri} alt="" aria-hidden="true" className={cn(box, "bg-muted")} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(box, "bg-primary text-base font-bold text-primary-foreground")}
    >
      {initial}
    </span>
  );
}
