"use client";

import { create } from "zustand";

/**
 * Frontend-owned Lens type
 * (independent of mocks and backend)
 */
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
}

export const useLensStore = create<LensState>((set) => ({
    lenses: [],
    activeLensId: null,

    setActiveLens: (id) => set({ activeLensId: id }),

    addLens: (lens) =>
        set((state) => ({
            lenses: [...state.lenses, lens],
        })),
}));






//m
// "use client";
//
// import { create } from "zustand";
// import { Lens, mockLenses } from "@/graphql/mock/lenses";
//
// interface LensState {
//     lenses: Lens[];
//     activeLensId: string | null;
//
//     setActiveLens: (id: string | null) => void;
//     addLens: (lens: Lens) => void;
// }
//
// export const useLensStore = create<LensState>((set) => ({
//     lenses: mockLenses,
//     activeLensId: null,
//
//     setActiveLens: (id) => set({ activeLensId: id }),
//
//     addLens: (lens) =>
//         set((state) => ({
//             lenses: [...state.lenses, lens],
//         })),
// }));
