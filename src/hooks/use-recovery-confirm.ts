import { useState } from "react";
import { useNavigate } from "react-router";
import { RECOVERY_KEY_GROUP_SIZE } from "@/constants/crypto.constants";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useRecoveryKeyDraft } from "@/hooks/use-recovery-key-draft";
import { ROUTES } from "@/routes/route-paths";
import { finishSetupWithNewKey } from "@/services/setup.service";

const clean = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "")
    .slice(0, RECOVERY_KEY_GROUP_SIZE);

/** "Prove you saved it": the second and fourth groups must be typed back before setup finishes. */
export function useRecoveryConfirm() {
  const navigate = useNavigate();
  const { completeSetup } = useAuth();
  const { recoveryKey } = useRecoveryKeyDraft();
  const request = useAuthRequest();
  const [second, setSecond] = useState("");
  const [fourth, setFourth] = useState("");

  const group = (index: number): string =>
    recoveryKey.slice(index * RECOVERY_KEY_GROUP_SIZE, (index + 1) * RECOVERY_KEY_GROUP_SIZE);
  const valid = second === group(1) && fourth === group(3);

  return {
    second,
    fourth,
    setSecond: (value: string) => {
      setSecond(clean(value));
    },
    setFourth: (value: string) => {
      setFourth(clean(value));
    },
    /** The neighbouring groups are shown masked, as in the design ("XXXX"). */
    valid,
    pending: request.pending,
    error: request.error,
    finish: async () => {
      if (!valid || request.pending) return;
      const done = await request.run((signal) =>
        finishSetupWithNewKey(recoveryKey, signal).then(() => true),
      );
      if (done) completeSetup();
    },
    showAgain: () => {
      void navigate(ROUTES.setupRecoveryKey);
    },
  };
}
