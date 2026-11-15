import { ChevronLeftIcon } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
  title: string;
  backTo: string;
  /** A sub-page names its parent next to the back button and puts its own title below. */
  parent?: string;
}

const BACK = cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "border-border bg-card");

export function SettingsHeader({ title, backTo, parent }: SettingsHeaderProps) {
  return (
    <header className="flex animate-rise flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link to={backTo} aria-label={parent ? `Back to ${parent}` : "Back"} className={BACK}>
          <ChevronLeftIcon />
        </Link>
        {parent ? (
          <span className="text-[0.8125rem] font-bold">{parent}</span>
        ) : (
          <h1 className="text-display">{title}</h1>
        )}
      </div>
      {parent && <h1 className="text-display">{title}</h1>}
    </header>
  );
}
