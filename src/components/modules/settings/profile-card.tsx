import { Card } from "@/components/ui/card";
import type { SessionRecord } from "@/schemas/session.schema";

/** Who is signed in: an ink square with the initial, the name and the email. */
export function ProfileCard({ session }: { session: SessionRecord | null }) {
  const name = session ? `${session.firstName} ${session.lastName}`.trim() : "";
  const source = name === "" ? (session?.email ?? "?") : name;
  const initial = source.charAt(0).toUpperCase();
  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground"
      >
        {initial}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-[0.9375rem] font-bold">{name === "" ? "…" : name}</p>
        <p className="truncate text-[0.78125rem] font-medium text-muted-foreground">
          {session?.email ?? "…"}
        </p>
      </div>
    </Card>
  );
}
