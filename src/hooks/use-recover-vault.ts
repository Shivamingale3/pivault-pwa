import { useState } from "react";
import { useNavigate } from "react-router";
import { RECOVERY_KEY_HEX_LENGTH } from "@/constants/crypto.constants";
import { SETUP_COPY } from "@/constants/setup.constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { ROUTES } from "@/routes/route-paths";
import { recoverVaultKey } from "@/services/setup.service";

/** New phone: the typed key is checked against the server's vault, then the rebuild starts. */
export function useRecoverVault() {
  const navigate = useNavigate();
  const request = useAuthRequest();
  const [value, setValueState] = useState("");
  const [incomplete, setIncomplete] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = async () => {
    if (request.pending) return;
    if (value.length < RECOVERY_KEY_HEX_LENGTH) {
      setIncomplete(true);
      setShakeKey((current) => current + 1);
      return;
    }
    const done = await request.run(() => recoverVaultKey(value).then(() => true));
    if (done) void navigate(ROUTES.setupRecovering, { replace: true });
    else setShakeKey((current) => current + 1);
  };

  const error = incomplete ? SETUP_COPY.recoverIncomplete : request.error;
  return {
    value,
    setValue: (next: string) => {
      setValueState(next);
      setIncomplete(false);
      request.clearError();
    },
    complete: value.length === RECOVERY_KEY_HEX_LENGTH,
    submit,
    pending: request.pending,
    error,
    shakeKey,
  };
}
