import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";


const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP!,
});


const authLink = setContext((_, { headers }) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    return {
        headers: {
            ...headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
    };
});


const wsLink =
    typeof window !== "undefined"
        ? new GraphQLWsLink(
            createClient({
                url: process.env.NEXT_PUBLIC_GRAPHQL_WS!,
                connectionParams: () => {
                    const token = localStorage.getItem("token");
                    return {
                        authorization: token ? `Bearer ${token}` : "",
                    };
                },
            })
        )
        : null;


const splitLink =
    typeof window !== "undefined" && wsLink
        ? split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === "OperationDefinition" &&
                    definition.operation === "subscription"
                );
            },
            wsLink,
            authLink.concat(httpLink)
        )
        : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    posts: {
                        keyArgs: false,
                        merge(existing, incoming) {
                            return incoming;
                        },
                    },
                },
            },
        },
    }),
});




//
// import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
//
// const httpLink = new HttpLink({
//     uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP || "http://localhost:4000/graphql",
//     credentials: "include", // optional if we need cookies
// });
//
// export const apolloClient = new ApolloClient({
//     link: httpLink,
//     cache: new InMemoryCache(),
// });
