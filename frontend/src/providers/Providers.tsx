"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastContainer } from "@/components/common/Toast";
import { CompareBar } from "@/components/jobs/CompareBar";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ToastContainer />
      <CompareBar />
    </QueryClientProvider>
  );
}
