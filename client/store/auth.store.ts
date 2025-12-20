"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
    id?: string;
    email?: string;
    username?: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;

    setSession: (token: string, user: User) => void;

    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;

    login: (user: User, token: string) => void;
    register: (user: User, token: string) => void;

    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,

            setSession: (token, user) => set({ token, user }),

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),

            login: (user, token) => set({ token, user }),
            register: (user, token) => set({ token, user }),

            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                set({ token: null, user: null });
            },
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
);
