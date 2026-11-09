import { LockIcon, MailIcon } from "lucide-react";
import { PIN_LENGTH } from "@/constants/design-system.constants";
import { useToggle } from "@/hooks/use-toggle";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

const PIN_SLOTS = Array.from({ length: PIN_LENGTH }, (_, index) => index);

export function FormShowcase() {
  const [passwordVisible, togglePasswordVisible] = useToggle();

  return (
    <ShowcaseSection eyebrow="04 · Fields" title="Filled fields, ink on focus">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-email">Email</Label>
        <InputGroup>
          <InputGroupAddon>
            <MailIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="ds-email"
            type="email"
            autoComplete="off"
            placeholder="you@email.com"
          />
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-password">Password</Label>
        <InputGroup>
          <InputGroupAddon>
            <LockIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="ds-password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="off"
            placeholder="••••••••"
            aria-invalid
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="sm"
              aria-pressed={passwordVisible}
              aria-controls="ds-password"
              onClick={togglePasswordVisible}
            >
              {passwordVisible ? "Hide" : "Show"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p className="px-1 text-xs font-semibold text-destructive-foreground">
          That email and password don't match.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-pin">App PIN</Label>
        <InputOTP id="ds-pin" maxLength={PIN_LENGTH} inputMode="numeric" pattern="^[0-9]*$">
          <InputOTPGroup>
            {PIN_SLOTS.map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ds-note">Note</Label>
        <Textarea id="ds-note" placeholder="Start writing…" />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-muted p-4.5">
        <Label htmlFor="ds-biometric" className="flex-col items-start gap-1.5 px-0">
          <span className="text-sm font-bold">Biometric unlock</span>
          <span className="text-xs font-medium text-muted-foreground">
            Use Face ID or fingerprint on this device
          </span>
        </Label>
        <Switch id="ds-biometric" defaultChecked />
      </div>
    </ShowcaseSection>
  );
}
