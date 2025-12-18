"use client";

import { create } from "zustand";
import { Lens, mockLenses } from "@/graphql/mock/lenses";

interface LensState {
    lenses: Lens[];
    activeLensId: string | null;

    setActiveLens: (id: string | null) => void;
    addLens: (lens: Lens) => void;
}

export const useLensStore = create<LensState>((set) => ({
    lenses: mockLenses,
    activeLensId: null,

    setActiveLens: (id) => set({ activeLensId: id }),

    addLens: (lens) =>
        set((state) => ({
            lenses: [...state.lenses, lens],
        })),
}));
