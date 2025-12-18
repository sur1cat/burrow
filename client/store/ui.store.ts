import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {

    theme: Theme;
    setTheme: (theme: Theme) => void;

    isCreatePostOpen: boolean;
    openCreatePost: () => void;
    closeCreatePost: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: "system",
            setTheme: (theme) => set({ theme }),

            isCreatePostOpen: false,
            openCreatePost: () => set({ isCreatePostOpen: true }),
            closeCreatePost: () => set({ isCreatePostOpen: false }),
        }),
        {
            name: "ui-store",
        }
    )
);
