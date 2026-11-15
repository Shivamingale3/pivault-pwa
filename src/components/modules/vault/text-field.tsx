import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: "text" | "url";
}

/** Label + single-line input, or a text area for longer text. */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  disabled,
  autoFocus,
  type = "text",
}: TextFieldProps) {
  const shared = {
    id,
    name: id,
    value,
    placeholder,
    disabled,
    autoFocus,
    autoComplete: "off",
    spellCheck: false,
  };
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          {...shared}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      ) : (
        <Input
          {...shared}
          type={type}
          autoCapitalize="none"
          autoCorrect="off"
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      )}
    </div>
  );
}
