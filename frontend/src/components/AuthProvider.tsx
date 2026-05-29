"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuthStore, AuthUser } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const attempted = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (attempted.current) return;
    // Already hydrated from a previous navigation — no refresh needed
    if (user) {
      setReady(true);
      return;
    }
    attempted.current = true;
    axios
      .post<{ accessToken: string; user: AuthUser }>("/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        if (res.data.user) {
          setAuth(res.data.accessToken, res.data.user);
        }
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
      })
      .finally(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#07070D] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED]/30 border-t-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
