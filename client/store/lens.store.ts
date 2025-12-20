"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Lens {
    id: string;
    name: string;
    author?: string;
    containsText?: string;
    minReactions?: number;
}

interface LensState {
    lenses: Lens[];
    activeLensId: string | null;

    setActiveLens: (id: string | null) => void;
    addLens: (lens: Lens) => void;
    removeLens: (id: string) => void;
}

export const useLensStore = create<LensState>()(
    persist(
        (set) => ({
            lenses: [],
            activeLensId: null,

            setActiveLens: (id) => set({ activeLensId: id }),

            addLens: (lens) =>
                set((state) => ({
                    lenses: [...state.lenses, lens],
                })),

            removeLens: (id) =>
                set((state) => ({
                    lenses: state.lenses.filter((l) => l.id !== id),
                    activeLensId: state.activeLensId === id ? null : state.activeLensId,
                })),
        }),
        {
            name: "lens-store",
        }
    )
);
