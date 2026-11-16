import { StrengthMeter } from "@/components/modules/kit/strength-meter";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CRUD_COPY, GENERATOR_TOGGLES } from "@/constants/vault-design.constants";
import { useGenerator } from "@/hooks/use-generator";
import { GENERATOR_LENGTH, type GeneratorOptions } from "@/utils/password-generator.utils";

interface GeneratorSheetProps {
  options: GeneratorOptions;
  /** Writes the password into the form, remembers the settings, and closes. */
  onUse: (password: string, options: GeneratorOptions) => void;
  onClose: () => void;
}

/** "Generate password": the result, its strength, a length slider and four switches. */
export function GeneratorSheet({ options: initial, onUse, onClose }: GeneratorSheetProps) {
  const { options, value, change, reroll } = useGenerator(initial);

  return (
    <Drawer
      open
      showSwipeHandle
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle>{CRUD_COPY.generatorTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Choose the length and what it may contain.
          </DrawerDescription>
          <Button type="button" variant="ghost" size="xs" onClick={reroll}>
            {CRUD_COPY.reroll}
          </Button>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
          <output
            aria-label="Generated password"
            className="rounded-[1.125rem] bg-muted px-4.5 py-4 font-mono text-[0.9375rem] font-bold break-all"
          >
            {value}
          </output>
          <StrengthMeter password={value} />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span id="generator-length" className="text-[0.9375rem] font-bold">
                {CRUD_COPY.length}
              </span>
              <span className="font-mono text-[0.9375rem] font-bold">{options.length}</span>
            </div>
            <Slider
              aria-labelledby="generator-length"
              min={GENERATOR_LENGTH.min}
              max={GENERATOR_LENGTH.max}
              value={[options.length]}
              onValueChange={(next) => {
                const length: unknown = Array.isArray(next) ? next[0] : next;
                if (typeof length === "number") change({ length });
              }}
            />
          </div>
          <ul className="divide-y divide-border">
            {GENERATOR_TOGGLES.map(({ key, title, meta }) => (
              <li key={key} className="flex items-center justify-between gap-3 py-3">
                <label htmlFor={`generator-${key}`} className="flex flex-col gap-0.5">
                  <span className="text-[0.9375rem] font-bold">{title}</span>
                  <span className="font-mono text-[0.6875rem] font-medium text-muted-foreground">
                    {meta}
                  </span>
                </label>
                <Switch
                  id={`generator-${key}`}
                  checked={options[key]}
                  onCheckedChange={(checked) => {
                    change({ [key]: checked });
                  }}
                />
              </li>
            ))}
          </ul>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              onUse(value, options);
            }}
          >
            {CRUD_COPY.usePassword}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
