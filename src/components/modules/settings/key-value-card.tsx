import { Card } from "@/components/ui/card";

interface KeyValueCardProps {
  label: string;
  rows: { name: string; value: string }[];
}

/** Eyebrow plus a card of rows: name on the left, mono value on the right. */
export function KeyValueCard({ label, rows }: KeyValueCardProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-eyebrow">{label}</h2>
      <Card className="gap-0 divide-y divide-border p-0">
        <dl>
          {rows.map(({ name, value }) => (
            <div key={name} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
              <dt className="text-sm font-semibold">{name}</dt>
              <dd className="font-mono text-xs font-bold text-muted-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}
