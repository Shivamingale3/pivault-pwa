import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CountdownCard } from "@/components/modules/kit/countdown-card";
import { InfoNote, WarningBlock } from "@/components/modules/kit/info-note";
import { Keypad } from "@/components/modules/kit/keypad";
import { PinCells } from "@/components/modules/kit/pin-cells";
import { RecoveryKeyInputs } from "@/components/modules/kit/recovery-key-inputs";
import { RecoveryKeyPanel } from "@/components/modules/kit/recovery-key-panel";
import { type Stage, StageList } from "@/components/modules/kit/stage-list";
import { StepProgress } from "@/components/modules/kit/step-progress";
import { SuccessOverlay } from "@/components/modules/kit/success-overlay";
import { usePinEntry } from "@/hooks/use-pin-entry";
import { downloadText } from "@/utils/download.utils";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Keypad", () => {
  it("has a real button per digit, plus backspace", async () => {
    const onDigit = vi.fn();
    const onBackspace = vi.fn();
    render(<Keypad onDigit={onDigit} onBackspace={onBackspace} />);
    const user = userEvent.setup();
    for (const digit of ["1", "5", "0"])
      await user.click(screen.getByRole("button", { name: digit }));
    await user.click(screen.getByRole("button", { name: "Backspace" }));
    expect(onDigit.mock.calls.map(([d]) => d as string)).toEqual(["1", "5", "0"]);
    expect(onBackspace).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("button")).toHaveLength(11);
  });

  it("shows the Face ID key only when asked to", async () => {
    const onBiometric = vi.fn();
    const { rerender } = render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Unlock with Face ID" })).toBeNull();
    rerender(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} onBiometric={onBiometric} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Unlock with Face ID" }));
    expect(onBiometric).toHaveBeenCalledOnce();
  });

  it("is inert while disabled", () => {
    render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} disabled />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("tabindex", "-1");
    }
  });
});

describe("PinCells", () => {
  it("says how many digits are in, masked by default", () => {
    render(<PinCells value="123" />);
    expect(screen.getByRole("group", { name: "3 of 6 digits entered" })).toHaveTextContent("•••");
  });

  it("can show the digits", () => {
    render(<PinCells value="1234" masked={false} />);
    expect(screen.getByRole("group")).toHaveTextContent("1234");
  });

  it("replays the shake only after a wrong entry", () => {
    const { rerender } = render(<PinCells value="" invalid shakeKey={0} />);
    expect(screen.getByRole("group").className).not.toContain("animate-shake");
    rerender(<PinCells value="" invalid shakeKey={1} />);
    expect(screen.getByRole("group").className).toContain("animate-shake");
  });
});

describe("usePinEntry", () => {
  it("collects up to six digits from the keypad, and completes once", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePinEntry({ onComplete }));
    act(() => {
      for (const d of "1357924") result.current.digit(d);
    });
    expect(result.current.value).toBe("135792");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("135792");
  });

  it("takes digits and backspace from a physical keyboard", () => {
    const { result } = renderHook(() => usePinEntry());
    act(() => {
      fireEvent.keyDown(window, { key: "4" });
      fireEvent.keyDown(window, { key: "2" });
      fireEvent.keyDown(window, { key: "x" });
      fireEvent.keyDown(window, { key: "Backspace" });
    });
    expect(result.current.value).toBe("4");
  });

  it("ignores everything while disabled", () => {
    const { result } = renderHook(() => usePinEntry({ disabled: true }));
    act(() => {
      result.current.digit("1");
      fireEvent.keyDown(window, { key: "2" });
    });
    expect(result.current.value).toBe("");
  });

  it("shake clears the cells and bumps the key", () => {
    const { result } = renderHook(() => usePinEntry());
    act(() => {
      result.current.digit("1");
      result.current.shake();
    });
    expect(result.current.value).toBe("");
    expect(result.current.shakeKey).toBe(1);
  });
});

describe("CountdownCard", () => {
  it("shows the wait in mono and is not announced every second", () => {
    render(
      <CountdownCard
        label="TRY AGAIN IN"
        remainingMs={24_000}
        caption="Attempt 5 of 5 · next wait 5 min"
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "off");
    expect(status).toHaveTextContent("TRY AGAIN IN");
    expect(status).toHaveTextContent("0:24");
    expect(status).toHaveTextContent("Attempt 5 of 5 · next wait 5 min");
  });
});

describe("notes and progress", () => {
  it("renders the info note and the warning", () => {
    render(
      <>
        <InfoNote>Quiet</InfoNote>
        <WarningBlock>Careful</WarningBlock>
      </>,
    );
    expect(screen.getByText("Quiet")).toBeInTheDocument();
    expect(screen.getByText("Careful")).toBeInTheDocument();
  });

  it("marks the current and earlier steps", () => {
    render(<StepProgress step={2} total={2} />);
    expect(screen.getByRole("progressbar", { name: "Step 2 of 2" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("lists stages with their counts and a bar", () => {
    const stages: Stage[] = [
      { label: "Vault key unwrapped", state: "done", value: "" },
      { label: "Records", state: "active", value: "7 of 12" },
      { label: "Decrypting", state: "waiting", value: "waiting" },
    ];
    render(<StageList stages={stages} percent={58} />);
    expect(screen.getByText("7 of 12")).toBeInTheDocument();
    expect(screen.getByText("waiting")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute(
      "aria-valuenow",
      "58",
    );
  });
});

describe("SuccessOverlay", () => {
  it("confirms, then reports done once", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<SuccessOverlay label="Signed in" onDone={onDone} durationMs={500} />);
    expect(screen.getByRole("status")).toHaveTextContent("Signed in");
    vi.advanceTimersByTime(499);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDone).toHaveBeenCalledOnce();
  });
});

describe("RecoveryKeyPanel", () => {
  it("shows every group of the key and the Copy and Download actions", async () => {
    const onCopy = vi.fn();
    const onDownload = vi.fn();
    render(
      <RecoveryKeyPanel
        displayKey="aaaaaaaa-bbbbbbbb-cccccccc-dddddddd"
        onCopy={onCopy}
        onDownload={onDownload}
      />,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "aaaaaaaa",
      "bbbbbbbb",
      "cccccccc",
      "dddddddd",
    ]);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onDownload).toHaveBeenCalledOnce();
  });
});

describe("downloadText", () => {
  it("saves a text file through a temporary link and cleans up", () => {
    const create = vi.fn(() => "blob:fake");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    downloadText("key.txt", "secret");
    expect(create).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});

function Harness() {
  const [value, setValue] = useState("");
  return (
    <>
      <RecoveryKeyInputs value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}
const group = (index: number) => screen.getByLabelText(`Recovery key, group ${String(index)} of 8`);

describe("RecoveryKeyInputs", () => {
  it("has eight boxes and only accepts hex characters", async () => {
    render(<Harness />);
    expect(screen.getAllByRole("textbox")).toHaveLength(8);
    await userEvent.setup().type(group(1), "zz12-g34");
    expect(screen.getByTestId("value")).toHaveTextContent("1234");
  });

  it("moves to the next box when a group is full", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.type(group(1), "0123456789");
    expect(screen.getByTestId("value")).toHaveTextContent("0123456789");
    expect(group(2)).toHaveFocus();
  });

  it("splits a pasted key across the boxes, in any case and with hyphens", async () => {
    render(<Harness />);
    const key = Array.from({ length: 8 }, (_, i) => String(i).repeat(8)).join("-");
    const user = userEvent.setup();
    await user.click(group(1));
    await user.paste(key.toUpperCase());
    const hex = key.replaceAll("-", "");
    expect(screen.getByTestId("value")).toHaveTextContent(hex);
    expect(group(3)).toHaveValue("22222222");
    expect(group(8)).toHaveFocus();
  });

  it("takes a whole key from a phone keyboard's paste, which arrives as typing, not as a paste", () => {
    render(<Harness />);
    const key = Array.from({ length: 8 }, (_, i) => String(i).repeat(8)).join("-");
    // The browser cuts typed text at maxLength: there must be room for the hyphens too.
    expect((group(1) as HTMLInputElement).maxLength).toBeGreaterThanOrEqual(key.length);
    fireEvent.change(group(1), { target: { value: key } });
    expect(screen.getByTestId("value")).toHaveTextContent(key.replaceAll("-", ""));
    expect(group(8)).toHaveValue("77777777");
  });

  it("goes back a box on backspace in an empty one", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.type(group(1), "01234567");
    expect(group(2)).toHaveFocus();
    await user.keyboard("{Backspace}");
    expect(group(1)).toHaveFocus();
  });
});
