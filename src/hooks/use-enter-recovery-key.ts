import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { finishSetupWithEnteredKey } from "@/services/setup.service";

/** New-device recovery: the user types the key they saved earlier. */
export function useEnterRecoveryKey() {
  const { completeSetup } = useAuth();
  const request = useAuthRequest();
  const [value, setValue] = useState("");

  const valid = value.trim().length > 0;

  const submit = async () => {
    if (!valid || request.pending) return;
    const done = await request.run(() => finishSetupWithEnteredKey(value).then(() => true));
    if (done) completeSetup();
  };

  return { value, setValue, valid, submit, pending: request.pending, error: request.error };
}
