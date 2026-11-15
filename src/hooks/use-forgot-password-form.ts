import { useState } from "react";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { isValidEmail } from "@/schemas/auth.schema";
import { requestPasswordReset } from "@/services/auth.service";

/** State, validation and submit for the forgot-password form. `sentTo` is set once the email is on its way. */
export function useForgotPasswordForm() {
  const request = useAuthRequest();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const valid = isValidEmail(email);

  const submit = async () => {
    if (!valid || request.pending) return;
    const target = email.trim();
    const done = await request.run(async (signal) => {
      await requestPasswordReset(target, signal);
      return true;
    });
    if (done) setSentTo(target);
  };

  return { email, setEmail, valid, sentTo, submit, ...request };
}
