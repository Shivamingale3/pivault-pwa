import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

describe("Button", () => {
  it("renders the pill primary by default", () => {
    render(<Button>Unlock</Button>);
    const button = screen.getByRole("button", { name: "Unlock" });
    expect(button).toHaveClass("rounded-full", "bg-primary", "h-13");
  });

  it("applies variant and size, and lets className win", () => {
    render(
      <Button variant="destructive-soft" size="sm" className="w-full">
        Sign out
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive-surface", "h-11", "w-full");
    expect(button).not.toHaveClass("bg-primary");
  });

  it("is disabled when asked", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("Input", () => {
  it("uses the filled field tokens and marks invalid state", () => {
    render(<Input aria-label="Email" aria-invalid />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveClass("bg-muted", "h-14.5", "aria-invalid:border-destructive");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Badge", () => {
  it("renders the success variant", () => {
    render(<Badge variant="success">Synced</Badge>);
    expect(screen.getByText("Synced")).toHaveClass("bg-success-surface", "text-success");
  });
});

describe("InputOTPSlot", () => {
  const renderPin = (masked: boolean) =>
    render(
      <InputOTP maxLength={2} value="47" aria-label="PIN">
        <InputOTPGroup>
          <InputOTPSlot index={0} masked={masked} />
          <InputOTPSlot index={1} masked={masked} />
        </InputOTPGroup>
      </InputOTP>,
    );

  it("masks PIN digits by default", () => {
    const { container } = renderPin(true);
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[0]).toHaveTextContent("•");
    expect(slots[0]).not.toHaveTextContent("4");
    expect(slots[0]).toHaveAttribute("data-filled", "true");
  });

  it("reveals digits only when unmasked", () => {
    const { container } = renderPin(false);
    const slots = container.querySelectorAll('[data-slot="input-otp-slot"]');
    expect(slots[1]).toHaveTextContent("7");
  });
});
