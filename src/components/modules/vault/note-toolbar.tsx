import { BoldIcon, CodeIcon, ItalicIcon, ListIcon, ListChecksIcon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Format } from "@/utils/markdown-edit.utils";

const FORMATS = [
  { format: "bold", label: "Bold", icon: BoldIcon },
  { format: "italic", label: "Italic", icon: ItalicIcon },
  { format: "list", label: "List", icon: ListIcon },
  { format: "checkbox", label: "Checkbox", icon: ListChecksIcon },
  { format: "code", label: "Code", icon: CodeIcon },
] as const;

interface NoteToolbarProps {
  onFormat: (format: Format) => void;
  onUndo: () => void;
  canUndo: boolean;
}

/** The formatting row between the title and the body: muted buttons (radius 12). Attach is left out: no media. */
export function NoteToolbar({ onFormat, onUndo, canUndo }: NoteToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex shrink-0 gap-2 overflow-x-auto border-y border-border py-2.5"
    >
      {FORMATS.map(({ format, label, icon: Icon }) => (
        <Button
          key={format}
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label={label}
          className="rounded-xl bg-muted"
          // Keep the text selection: don't let the button take focus first.
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            onFormat(format);
          }}
        >
          <Icon />
        </Button>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label="Undo"
        disabled={!canUndo}
        className="rounded-xl bg-muted"
        onClick={onUndo}
      >
        <Undo2Icon />
      </Button>
    </div>
  );
}
