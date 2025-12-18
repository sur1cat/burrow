export type LensRule =
    | { type: "minReactions"; value: number }
    | { type: "author"; value: string }
    | { type: "containsText"; value: string };

export interface Lens {
    id: string;
    name: string;
    rules: LensRule[];
    pinned?: boolean;
}

export const mockLenses: Lens[] = [
    {
        id: "lens-1",
        name: "Popular Posts",
        rules: [{ type: "minReactions", value: 2 }],
        pinned: true,
    },
    {
        id: "lens-2",
        name: "My Mentions",
        rules: [{ type: "containsText", value: "@you" }],
    },
];
