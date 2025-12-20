"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <nav className="navbar">
            <Link href="/feed" className="navbar-brand">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="8" cy="10" r="1.5" fill="white" />
                    <circle cx="16" cy="10" r="1.5" fill="white" />
                    <path d="M8 15 Q12 18 16 15" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
                burrow
            </Link>

            <div className="navbar-nav">
                <ThemeToggle />

                {user ? (
                    <>
                        <Link href="/feed" className="navbar-link">
                            Home
                        </Link>
                        <Link href="/saved" className="navbar-link">
                            Saved
                        </Link>
                        <Link href="/profile" className="navbar-link">
                            u/{user.username}
                        </Link>
                        <button onClick={logout} className="navbar-btn navbar-btn-outline">
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="navbar-btn navbar-btn-outline">
                            Log In
                        </Link>
                        <Link href="/register" className="navbar-btn navbar-btn-primary">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
