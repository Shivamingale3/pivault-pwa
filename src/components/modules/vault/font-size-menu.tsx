import { CaseSensitiveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FONT_SIZE_COPY } from "@/constants/vault-design.constants";
import { useNoteFontSize } from "@/hooks/use-note-font-size";
import { NOTE_FONT_SIZES, type NoteFontSize } from "@/schemas/preferences.schema";
import { errorMessage } from "@/utils/error-message.utils";

const isSize = (value: unknown): value is NoteFontSize =>
  NOTE_FONT_SIZES.some((size) => size === value);

/** The toolbar's text size button: Small, Default, Large or Extra large. Applies at once. */
export function FontSizeMenu() {
  const { size, choose } = useNoteFontSize();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={FONT_SIZE_COPY.button}
            className="rounded-xl bg-muted"
          />
        }
      >
        <CaseSensitiveIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuRadioGroup
          value={size}
          onValueChange={(next) => {
            if (isSize(next))
              choose(next).catch((error: unknown) => toast.error(errorMessage(error)));
          }}
        >
          {NOTE_FONT_SIZES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {FONT_SIZE_COPY[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
