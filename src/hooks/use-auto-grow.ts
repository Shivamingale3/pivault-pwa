import { type RefObject, useLayoutEffect } from "react";

/**
 * Makes a text area as tall as its text, so a long note scrolls the whole screen instead of
 * scrolling inside a small box squeezed between the header and the toolbar.
 */
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${String(element.scrollHeight)}px`;
  }, [ref, value]);
}
