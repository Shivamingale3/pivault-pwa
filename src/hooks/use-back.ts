import { useCallback } from "react";
import { useNavigate } from "react-router";

/** How deep into this app's own history we are (React Router keeps it on `history.state`). */
const historyIndex = (): number => {
  const state: unknown = window.history.state;
  return typeof state === "object" &&
    state !== null &&
    "idx" in state &&
    typeof state.idx === "number"
    ? state.idx
    : 0;
};

/**
 * In-app "Back" that behaves like the phone's back button: it returns to the screen the user came
 * from instead of pushing a new one, so the history never fills with screens to walk back through.
 * With nothing to go back to (opened directly), it replaces the screen with `fallback`.
 */
export function useBack() {
  const navigate = useNavigate();
  return useCallback(
    (fallback: string, steps = 1) => {
      if (historyIndex() >= steps) void navigate(-steps);
      else void navigate(fallback, { replace: true });
    },
    [navigate],
  );
}
