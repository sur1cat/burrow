"use client";

import { useThemeStore } from "@/store/theme.store";

export default function ThemeToggle() {
    const { theme, setTheme } = useThemeStore();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn active"
            title={theme === "light" ? "Switch to dark" : "Switch to light"}
            aria-label="Toggle theme"
        >
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}
