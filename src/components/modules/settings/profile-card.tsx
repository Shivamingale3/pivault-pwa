import { UserAvatar } from "@/components/modules/kit/user-avatar";
import { Card } from "@/components/ui/card";
import type { SessionRecord } from "@/schemas/session.schema";

/** Who is signed in: an ink square with the initial, the name and the email. */
export function ProfileCard({ session }: { session: SessionRecord | null }) {
  const name = session ? `${session.firstName} ${session.lastName}`.trim() : "";
  const source = name === "" ? (session?.email ?? "?") : name;
  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <UserAvatar name={source} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-[0.9375rem] font-bold">{name === "" ? "…" : name}</p>
        <p className="truncate text-[0.78125rem] font-medium text-muted-foreground">
          {session?.email ?? "…"}
        </p>
      </div>
    </Card>
  );
}
