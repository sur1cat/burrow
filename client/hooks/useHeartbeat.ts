"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { HEARTBEAT } from "@/graphql/mutations/posts";
import { useAuthStore } from "@/store/auth.store";

const HEARTBEAT_INTERVAL = 2 * 60 * 1000;

export function useHeartbeat() {
    const { token } = useAuthStore();
    const [sendHeartbeat] = useMutation(HEARTBEAT);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!token) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const beat = () => {
            sendHeartbeat().catch(() => {});
        };

        beat();

        intervalRef.current = setInterval(beat, HEARTBEAT_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [token, sendHeartbeat]);
}
