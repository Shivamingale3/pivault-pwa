import { useState } from "react";
import { toast } from "sonner";
import { CHANGE_PASSWORD_COPY } from "@/constants/settings.constants";
import { useBack } from "@/hooks/use-back";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useSetPasswordForm } from "@/hooks/use-set-password-form";
import { ROUTES } from "@/routes/route-paths";
import { changePassword } from "@/services/auth.service";

/** Change password: the current one, a new one that passes the rules, typed twice. Needs a connection. */
export function useChangePassword() {
  const back = useBack();
  const request = useAuthRequest();
  const form = useSetPasswordForm();
  const [current, setCurrentState] = useState("");
  const valid = current.length > 0 && form.valid;

  const submit = async () => {
    if (!valid || request.pending) return;
    const done = await request.run((signal) =>
      changePassword(current, form.password, signal).then(() => true),
    );
    if (!done) return;
    toast.success(CHANGE_PASSWORD_COPY.done);
    back(ROUTES.settings);
  };

  return {
    form,
    current,
    setCurrent: (value: string) => {
      setCurrentState(value);
      request.clearError();
    },
    valid,
    submit,
    pending: request.pending,
    error: request.error,
  };
}
