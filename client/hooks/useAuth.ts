
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore, User } from "@/store/auth.store";
import type { LoginSchema, RegisterSchema } from "@/lib/validators";

type LoginResponse = {
    login: {
        token?: string | null;
        user?: User | null;
    };
};

type RegisterResponse = {
    register: {
        token?: string | null;
        user?: User | null;
    };
};

export function useAuth() {
    const router = useRouter();

    const setUser = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);

    const [loginMutation, { loading: loginLoading }] =
        useMutation<LoginResponse, LoginSchema>(LOGIN_MUTATION);

    const [registerMutation, { loading: registerLoading }] =
        useMutation<RegisterResponse, RegisterSchema>(REGISTER_MUTATION);

    async function login(data: LoginSchema) {
        const res = await loginMutation({ variables: data });

        const token = res.data?.login.token ?? null;
        const user = res.data?.login.user ?? null;

        if (token == null) throw new Error("Invalid login response: missing token");

        setUser(user);   // user is User | null
        setToken(token); // token is string | null

        router.push("/(main)/feed");
    }

    async function register(data: RegisterSchema) {
        const res = await registerMutation({ variables: data });

        const token = res.data?.register.token ?? null;
        const user = res.data?.register.user ?? null;

        if (token == null) throw new Error("Invalid register response: missing token");

        setUser(user);
        setToken(token);

        router.push("/(main)/feed");
    }

    return {
        login,
        register,
        loginLoading,
        registerLoading,
    };
}
