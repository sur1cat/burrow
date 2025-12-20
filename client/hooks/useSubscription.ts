"use client";

import { DocumentNode } from "@apollo/client";
import { useSubscription as apolloUseSubscription } from "@apollo/client/react";

export function useSubscription<TData = unknown>(
    query: DocumentNode,
    options?: { variables?: Record<string, unknown>; skip?: boolean }
) {
    const { data, loading, error } = apolloUseSubscription<TData>(
        query,
        options as Parameters<typeof apolloUseSubscription<TData>>[1]
    );

    return { data, loading, error };
}
