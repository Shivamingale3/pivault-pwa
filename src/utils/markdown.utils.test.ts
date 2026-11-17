import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown, toggleCheck, wordCount } from "@/utils/markdown.utils";

const SOURCE = [
  "Keep **these** safe, *really*.",
  "",
  "## Codes",
  "```",
  "ABCD-1234",
  "```",
  "- one",
  "- two",
  "- [ ] print",
  "- [x] store `offline`",
].join("\n");

describe("markdown", () => {
  it("splits inline bold, italic and code", () => {
    expect(parseInline("a **b** *c* `d`")).toEqual([
      { type: "text", text: "a " },
      { type: "bold", text: "b" },
      { type: "text", text: " " },
      { type: "italic", text: "c" },
      { type: "text", text: " " },
      { type: "code", text: "d" },
    ]);
  });

  it("parses paragraphs, headings, code, lists and checklists", () => {
    const blocks = parseMarkdown(SOURCE);
    expect(blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "heading",
      "code",
      "list",
      "checklist",
    ]);
    expect(blocks[2]).toEqual({ type: "code", text: "ABCD-1234" });
    const checklist = blocks[4];
    expect(
      checklist?.type === "checklist" && checklist.items.map((item) => [item.line, item.checked]),
    ).toEqual([
      [8, false],
      [9, true],
    ]);
  });

  it("treats html as plain text and survives an unclosed code block", () => {
    expect(parseMarkdown("<img src=x onerror=alert(1)>")).toEqual([
      { type: "paragraph", lines: [[{ type: "text", text: "<img src=x onerror=alert(1)>" }]] },
    ]);
    expect(parseMarkdown("```\nopen")).toEqual([{ type: "code", text: "open" }]);
  });

  it("toggles one checklist line and nothing else", () => {
    const ticked = toggleCheck(SOURCE, 8);
    expect(ticked.split("\n")[8]).toBe("- [x] print");
    expect(toggleCheck(ticked, 8)).toBe(SOURCE);
    expect(toggleCheck(SOURCE, 0)).toBe(SOURCE);
  });

  it("keeps each line of a paragraph as its own line", () => {
    expect(parseMarkdown("wifi: home\npassword: on the router\n\nnext")).toEqual([
      {
        type: "paragraph",
        lines: [
          [{ type: "text", text: "wifi: home" }],
          [{ type: "text", text: "password: on the router" }],
        ],
      },
      { type: "paragraph", lines: [[{ type: "text", text: "next" }]] },
    ]);
  });

  it("handles notes with Windows line endings", () => {
    const windows = "- [ ] one\r\n- [x] two\r\n";
    expect(parseMarkdown(windows).map((block) => block.type)).toEqual(["checklist"]);
    expect(toggleCheck(windows, 0)).toBe("- [x] one\r\n- [x] two\r\n");
  });

  it("counts words", () => {
    expect(wordCount("one two\n- three **four**")).toBe(4);
    expect(wordCount("")).toBe(0);
  });
});
