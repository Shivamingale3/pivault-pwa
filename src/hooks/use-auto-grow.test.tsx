import { render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useAutoGrow } from "@/hooks/use-auto-grow";

function Area({ value }: { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(ref, value);
  return <textarea ref={ref} value={value} readOnly aria-label="body" />;
}

describe("useAutoGrow", () => {
  it("sets the height to fit the text, and again when the text changes", () => {
    const height = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(120);
    const { getByLabelText, rerender } = render(<Area value="one line" />);
    expect(getByLabelText("body").style.height).toBe("120px");
    height.mockReturnValue(480);
    rerender(<Area value={"many\nlines\nnow"} />);
    expect(getByLabelText("body").style.height).toBe("480px");
    height.mockRestore();
  });
});
