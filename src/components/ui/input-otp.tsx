import * as React from "react";
import { cn } from "@/lib/utils";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex w-full items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex w-full items-center gap-2.5", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  masked = true,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
  /** PINs are secrets: render a bullet instead of the digit unless explicitly revealed. */
  masked?: boolean;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={Boolean(char)}
      className={cn(
        "relative flex h-14.5 min-w-0 flex-1 items-center justify-center rounded-lg border-[1.5px] border-border bg-background text-[1.375rem] font-semibold text-foreground transition-colors outline-none aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-foreground/35 data-[active=true]:aria-invalid:border-destructive data-[filled=true]:border-foreground data-[filled=true]:bg-muted",
        className,
      )}
      {...props}
    >
      {char && (masked ? "•" : char)}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-0.5 animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center text-subtle [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
