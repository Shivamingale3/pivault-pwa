/** The small markdown subset notes use. Parsed into plain data and rendered as React nodes: never HTML. */
export interface Inline {
  type: "text" | "bold" | "italic" | "code";
  text: string;
}

export type Block =
  /** One line of text per entry: a line break in the note stays a line break. */
  | { type: "paragraph"; lines: Inline[][] }
  | { type: "heading"; inline: Inline[] }
  | { type: "code"; text: string }
  | { type: "list"; items: Inline[][] }
  | { type: "checklist"; items: { line: number; checked: boolean; inline: Inline[] }[] };

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/;
const CHECK = /^- \[( |x|X)\] (.*)$/;
const BULLET = /^- (.*)$/;

export function parseInline(text: string): Inline[] {
  return text
    .split(INLINE)
    .filter((part) => part !== "")
    .map((part): Inline => {
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**"))
        return { type: "bold", text: part.slice(2, -2) };
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`"))
        return { type: "code", text: part.slice(1, -1) };
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*"))
        return { type: "italic", text: part.slice(1, -1) };
      return { type: "text", text: part };
    });
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.split(/\r?\n/);
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
    } else if (line.startsWith("```")) {
      const end = lines.findIndex((candidate, at) => at > index && candidate.startsWith("```"));
      const stop = end === -1 ? lines.length : end;
      blocks.push({ type: "code", text: lines.slice(index + 1, stop).join("\n") });
      index = stop + 1;
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "heading", inline: parseInline(line.slice(3)) });
      index += 1;
    } else if (CHECK.test(line)) {
      const items = [];
      for (
        let match = CHECK.exec(lines[index] ?? "");
        match;
        match = CHECK.exec(lines[index] ?? "")
      ) {
        items.push({ line: index, checked: match[1] !== " ", inline: parseInline(match[2] ?? "") });
        index += 1;
      }
      blocks.push({ type: "checklist", items });
    } else if (BULLET.test(line)) {
      const items = [];
      for (
        let text = lines[index] ?? "";
        BULLET.test(text) && !CHECK.test(text);
        text = lines[index] ?? ""
      ) {
        items.push(parseInline(text.slice(2)));
        index += 1;
      }
      blocks.push({ type: "list", items });
    } else {
      const start = index;
      const special = (text: string) =>
        text.trim() === "" || text.startsWith("```") || text.startsWith("## ") || BULLET.test(text);
      while (index < lines.length && !special(lines[index] ?? "")) index += 1;
      blocks.push({ type: "paragraph", lines: lines.slice(start, index).map(parseInline) });
    }
  }
  return blocks;
}

/** Ticks or unticks the checklist item on `line`. Any other line is left alone. */
export function toggleCheck(source: string, line: number): string {
  const lines = source.split("\n");
  const raw = lines[line] ?? "";
  // Notes pasted from Windows keep their carriage returns: put it back after the change.
  const ending = raw.endsWith("\r") ? "\r" : "";
  const match = CHECK.exec(ending ? raw.slice(0, -1) : raw);
  if (!match) return source;
  lines[line] = `- [${match[1] === " " ? "x" : " "}] ${match[2] ?? ""}${ending}`;
  return lines.join("\n");
}

/** Words in the text, not counting the checklist markers. */
export const wordCount = (source: string): number =>
  source
    .replace(/^- \[[ xX]\] /gm, "")
    .split(/\s+/)
    .filter((word) => /\w/.test(word)).length;
