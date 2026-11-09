import { useCallback, useState } from "react";

/** Boolean state with a stable toggle callback. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => {
    setValue((current) => !current);
  }, []);
  return [value, toggle, setValue] as const;
}
