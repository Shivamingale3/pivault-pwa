import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { LINK_TOKEN_PARAM } from "@/constants/password-link.constants";

/**
 * Reads the emailed token from `?key=` once, keeps it in memory only, and immediately removes it
 * from the address bar, so it does not linger in history, screenshots or shared URLs.
 */
export function useLinkToken(): string | null {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => params.get(LINK_TOKEN_PARAM));

  useEffect(() => {
    if (!params.has(LINK_TOKEN_PARAM)) return;
    const rest = new URLSearchParams(params);
    rest.delete(LINK_TOKEN_PARAM);
    void navigate({ pathname, search: rest.toString() }, { replace: true });
  }, [params, pathname, navigate]);

  return token;
}
