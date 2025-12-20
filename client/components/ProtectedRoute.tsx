"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !user && !token) {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                router.push("/login");
            }
        }
    }, [isHydrated, user, token, router]);

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!user && !token && !storedToken) {
        return null;
    }

    return <>{children}</>;
}
