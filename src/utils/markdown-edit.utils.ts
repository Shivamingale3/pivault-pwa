export type Format = "bold" | "italic" | "list" | "checkbox" | "code";

export interface Edit {
  text: string;
  /** Where the selection should be afterwards. */
  start: number;
  end: number;
}

const WRAP: Record<"bold" | "italic", string> = { bold: "**", italic: "*" };
const PREFIX: Record<"list" | "checkbox", string> = { list: "- ", checkbox: "- [ ] " };

/** Applies a toolbar format to the selection (or the current line) of a note's markdown. */
export function applyFormat(text: string, start: number, end: number, format: Format): Edit {
  const selected = text.slice(start, end);
  if (format === "bold" || format === "italic") {
    const mark = WRAP[format];
    return {
      text: text.slice(0, start) + mark + selected + mark + text.slice(end),
      start: start + mark.length,
      end: end + mark.length,
    };
  }
  if (format === "code") {
    if (selected.includes("\n") || selected === "") {
      const before = start > 0 && text[start - 1] !== "\n" ? "\n" : "";
      const block = `${before}\`\`\`\n${selected}\n\`\`\`\n`;
      const cursor = start + before.length + 4;
      return {
        text: text.slice(0, start) + block + text.slice(end),
        start: cursor,
        end: cursor + selected.length,
      };
    }
    return {
      text: `${text.slice(0, start)}\`${selected}\`${text.slice(end)}`,
      start: start + 1,
      end: end + 1,
    };
  }
  // List and checkbox: toggle the prefix on every line the selection touches.
  const prefix = PREFIX[format];
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = text.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(lineStart, lineEnd).split("\n");
  const all = lines.every((line) => line.startsWith(prefix));
  const changed = lines
    .map((line) =>
      all ? line.slice(prefix.length) : prefix + line.replace(/^- (\[[ xX]\] )?/, ""),
    )
    .join("\n");
  const cursor = lineStart + changed.length;
  return {
    text: text.slice(0, lineStart) + changed + text.slice(lineEnd),
    start: cursor,
    end: cursor,
  };
}
