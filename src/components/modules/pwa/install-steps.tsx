import type { InstallStep } from "@/constants/install-steps.constants";

interface InstallStepsProps {
  steps: readonly InstallStep[];
}

export function InstallSteps({ steps }: InstallStepsProps) {
  return (
    <ol aria-label="How to install" className="flex flex-col gap-2.5">
      {steps.map(({ icon: Icon, title, detail }, index) => (
        <li
          key={title}
          className="flex items-center gap-4 rounded-lg border-[1.5px] border-border bg-card p-4"
        >
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted"
          >
            <Icon className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-[0.625rem] font-bold tracking-label text-muted-foreground uppercase">
              Step {index + 1}
            </span>
            <span className="text-[0.9375rem] font-bold tracking-tight">{title}</span>
            <span className="text-xs leading-normal font-medium text-muted-foreground">
              {detail}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
