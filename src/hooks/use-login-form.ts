import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { isValidEmail } from "@/schemas/auth.schema";
import { login } from "@/services/auth.service";

/** State, validation and submit for the login form. */
export function useLoginForm() {
  const { signIn } = useAuth();
  const request = useAuthRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const valid = isValidEmail(email) && password.length > 0;

  const submit = async () => {
    if (!valid || request.pending) return;
    const session = await request.run((signal) => login(email, password, signal));
    if (session) signIn(session);
  };

  return { email, setEmail, password, setPassword, valid, submit, ...request };
}
