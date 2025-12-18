
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP || "http://localhost:4000/graphql",
    credentials: "include", // optional if we need cookies
});

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
