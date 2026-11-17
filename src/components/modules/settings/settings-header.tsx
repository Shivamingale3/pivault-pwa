import { BackButton } from "@/components/modules/kit/back-button";

interface SettingsHeaderProps {
  title: string;
  backTo: string;
  /** A sub-page names its parent next to the back button and puts its own title below. */
  parent?: string;
}

export function SettingsHeader({ title, backTo, parent }: SettingsHeaderProps) {
  return (
    <header className="flex animate-rise flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton fallback={backTo} label={parent ? `Back to ${parent}` : "Back"} onCanvas />
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
