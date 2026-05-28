"use client";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore, AuthUser } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || user) return;
    attempted.current = true;
    axios
      .post<{ accessToken: string; user: AuthUser }>("/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        if (res.data.user) {
          setAuth(res.data.accessToken, res.data.user);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
