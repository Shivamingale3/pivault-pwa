import { Fragment, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type Inline, parseMarkdown } from "@/utils/markdown.utils";

const inline = (parts: Inline[]): ReactNode =>
  parts.map((part, index) => {
    if (part.type === "bold")
      return (
        <strong key={index} className="font-bold">
          {part.text}
        </strong>
      );
    if (part.type === "italic") return <em key={index}>{part.text}</em>;
    if (part.type === "code")
      return (
        <code
          key={index}
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.78125rem] font-semibold"
        >
          {part.text}
        </code>
      );
    return part.text;
  });

interface MarkdownViewProps {
  source: string;
  /** Ticks or unticks the checklist item on that line. */
  onToggle: (line: number) => void;
}

/** A note's body, rendered from its markdown as React elements (never as HTML). */
export function MarkdownView({ source, onToggle }: MarkdownViewProps) {
  return (
    <div className="flex flex-col gap-3.5 text-[0.9375rem] leading-[1.55] font-medium wrap-break-word">
      {parseMarkdown(source).map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="pt-1 text-[0.90625rem] font-bold">
                {inline(block.inline)}
              </h2>
            );
          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-[0.875rem] bg-muted p-3.5 font-mono text-[0.78125rem] font-semibold"
              >
                <code>{block.text}</code>
              </pre>
            );
          case "list":
            return (
              <ul key={index} className="flex list-disc flex-col gap-1 pl-5">
                {block.items.map((item, at) => (
                  <li key={at}>{inline(item)}</li>
                ))}
              </ul>
            );
          case "checklist":
            return (
              <ul key={index} className="flex flex-col gap-2.5">
                {block.items.map((item) => (
                  <li key={item.line}>
                    <label className="flex min-h-7 items-center gap-3">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => {
                          onToggle(item.line);
                        }}
                      />
                      <span className={cn(item.checked && "text-muted-foreground line-through")}>
                        {inline(item.inline)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            );
          case "paragraph":
            return (
              <p key={index} className="whitespace-pre-wrap">
                {block.lines.map((line, at) => (
                  <Fragment key={at}>
                    {at > 0 && <br />}
                    {inline(line)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
