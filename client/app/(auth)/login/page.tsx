"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/store/auth.store";

interface LoginResponse {
    login: {
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
        };
    };
}

interface LoginVariables {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [login, { loading, error }] = useMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await login({
                variables: { email, password },
            });

            const token = data?.login?.token;
            const user = data?.login?.user;

            if (!token || !user) {
                throw new Error("Invalid login response");
            }

            localStorage.setItem("token", token);
            setSession(token, user);
            router.push("/feed");
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <svg className="auth-logo" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="8" cy="10" r="1.5" fill="white" />
                        <circle cx="16" cy="10" r="1.5" fill="white" />
                        <path d="M8 15 Q12 18 16 15" stroke="white" strokeWidth="1.5" fill="none" />
                    </svg>
                    <h1 className="auth-title">Log In</h1>
                    <p className="auth-subtitle">
                        Welcome back to Burrow
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error.message}
                        </div>
                    )}

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="Email"
                        required
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        placeholder="Password"
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="auth-footer">
                    New to Burrow?{" "}
                    <Link href="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
