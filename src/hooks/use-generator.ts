import { useState } from "react";
import {
  DEFAULT_GENERATOR,
  type GeneratorOptions,
  generatePassword,
} from "@/utils/password-generator.utils";

/** The generator sheet's state: every change to a setting makes a new password at once. */
export function useGenerator(initial: GeneratorOptions = DEFAULT_GENERATOR) {
  const [options, setOptions] = useState(initial);
  const [value, setValue] = useState(() => generatePassword(initial));

  const change = (patch: Partial<GeneratorOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    setValue(generatePassword(next));
  };

  return {
    options,
    value,
    change,
    reroll: () => {
      setValue(generatePassword(options));
    },
  };
}
