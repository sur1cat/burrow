"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth";
import { CHECK_USERNAME_AVAILABLE } from "@/graphql/queries/users";
import { useAuthStore } from "@/store/auth.store";

interface RegisterResponse {
    register: {
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
        };
    };
}

interface RegisterVariables {
    username: string;
    email: string;
    password: string;
}

interface UsernameCheckResponse {
    checkUsernameAvailable: {
        available: boolean;
        reason: string | null;
    };
}

export default function RegisterPage() {
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameStatus, setUsernameStatus] = useState<{
        checking: boolean;
        available: boolean | null;
        reason: string | null;
    }>({ checking: false, available: null, reason: null });

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const [register, { loading, error }] = useMutation<RegisterResponse, RegisterVariables>(REGISTER_MUTATION);

    const [checkUsername] = useLazyQuery<UsernameCheckResponse>(CHECK_USERNAME_AVAILABLE, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!username || username.length < 3) {
            setUsernameStatus({ checking: false, available: null, reason: null });
            return;
        }

        setUsernameStatus({ checking: true, available: null, reason: null });

        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await checkUsername({ variables: { username } });
                if (data?.checkUsernameAvailable) {
                    setUsernameStatus({
                        checking: false,
                        available: data.checkUsernameAvailable.available,
                        reason: data.checkUsernameAvailable.reason,
                    });
                }
            } catch {
                setUsernameStatus({ checking: false, available: null, reason: null });
            }
        }, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [username, checkUsername]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await register({
                variables: { username, email, password },
            });

            const token = data?.register?.token;
            const user = data?.register?.user;

            if (!token || !user) {
                throw new Error("Invalid register response");
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
                    <h1 className="auth-title">Sign Up</h1>
                    <p className="auth-subtitle">
                        Join the Burrow community
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

                    <div className="username-input-wrapper">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`input ${usernameStatus.available === true ? "input-success" : ""} ${usernameStatus.available === false ? "input-error" : ""}`}
                            placeholder="Username"
                            required
                        />
                        {usernameStatus.checking && (
                            <span className="username-status username-checking">
                                <svg width="16" height="16" viewBox="0 0 24 24" className="spin">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" />
                                </svg>
                            </span>
                        )}
                        {!usernameStatus.checking && usernameStatus.available === true && (
                            <span className="username-status username-available">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>
                        )}
                        {!usernameStatus.checking && usernameStatus.available === false && (
                            <span className="username-status username-taken">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </span>
                        )}
                    </div>
                    {usernameStatus.reason && (
                        <p className="username-reason">{usernameStatus.reason}</p>
                    )}

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
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already a member?{" "}
                    <Link href="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
}
