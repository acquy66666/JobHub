"use client";
import { create } from "zustand";

export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profile?: {
    id: string;
    fullName?: string;
    avatarUrl?: string | null;
    companyName?: string;
    logoUrl?: string | null;
  } | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
