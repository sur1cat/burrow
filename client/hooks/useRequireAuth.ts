"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export function useRequireAuth() {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    const requireAuth = (callback: () => void) => {
        if (!user) {
            router.push("/register");
            return;
        }
        callback();
    };

    return { requireAuth, isAuthenticated: !!user };
}
