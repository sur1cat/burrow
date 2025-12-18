"use client";

import {
    DocumentNode,
    OperationVariables,
} from "@apollo/client";

import {
    useSubscription as apolloUseSubscription,
    SubscriptionOptions,
} from "@apollo/client/react/hooks/useSubscription";
//dk


export function useSubscription<
    TData = unknown,
    TVariables = OperationVariables
>(
    query: DocumentNode,
    options?: SubscriptionOptions<TVariables>
) {
    const { data, loading, error } = apolloUseSubscription<
        TData,
        TVariables
    >(query, options);

    return { data, loading, error };
}
