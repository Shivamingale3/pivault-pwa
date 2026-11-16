import { describe, expect, it } from "vitest";
import { applyFormat } from "@/utils/markdown-edit.utils";

describe("applyFormat", () => {
  it("wraps the selection in bold or italic and keeps it selected", () => {
    expect(applyFormat("a word b", 2, 6, "bold")).toEqual({
      text: "a **word** b",
      start: 4,
      end: 8,
    });
    expect(applyFormat("a word b", 2, 6, "italic")).toEqual({
      text: "a *word* b",
      start: 3,
      end: 7,
    });
  });

  it("makes inline code from a selection and a block from nothing", () => {
    expect(applyFormat("run ls now", 4, 6, "code").text).toBe("run `ls` now");
    const block = applyFormat("intro", 5, 5, "code");
    expect(block.text).toBe("intro\n```\n\n```\n");
    expect(block.start).toBe(10);
  });

  it("toggles a list or checkbox prefix on the touched lines", () => {
    expect(applyFormat("one\ntwo", 0, 7, "list").text).toBe("- one\n- two");
    expect(applyFormat("- one\n- two", 0, 11, "list").text).toBe("one\ntwo");
    expect(applyFormat("- one", 2, 2, "checkbox").text).toBe("- [ ] one");
    expect(applyFormat("x\ntask", 4, 4, "checkbox").text).toBe("x\n- [ ] task");
  });
});
