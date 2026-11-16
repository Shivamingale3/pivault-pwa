import { CopyIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecoveryKeyPanelProps {
  /** The key in display form: groups separated by hyphens. */
  displayKey: string;
  onCopy: () => void;
  onDownload: () => void;
}

/** The key in group chips (mono 17/700 on cards) with Copy and Download side by side. */
export function RecoveryKeyPanel({ displayKey, onCopy, onDownload }: RecoveryKeyPanelProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-3xl border-[1.5px] border-border bg-muted p-3.5">
      <ul aria-label="Recovery key" className="grid grid-cols-2 gap-2.5 select-all">
        {displayKey.split("-").map((group, index) => (
          <li
            key={index}
            className="flex h-12 items-center justify-center rounded-xl bg-card font-mono text-[1.0625rem] font-bold tracking-wider"
          >
            {group}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2.5">
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon aria-hidden="true" />
          Copy
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDownload}>
          <DownloadIcon aria-hidden="true" />
          Download
        </Button>
      </div>
    </div>
  );
}
