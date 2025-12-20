"use client";

import { Lens } from "@/store/lens.store";

export default function LensSelector({
    lenses,
    activeLensId,
    onSelect,
}: {
    lenses: Lens[];
    activeLensId: string | null;
    onSelect: (id: string | null) => void;
}) {
    const activeLens = lenses.find((l) => l.id === activeLensId);

    return (
        <div className="lens-selector">
            <span className="lens-label">Lens:</span>
            <select
                value={activeLensId ?? ""}
                onChange={(e) => onSelect(e.target.value || null)}
                className="lens-select"
            >
                <option value="">All posts</option>
                {lenses.map((lens) => (
                    <option key={lens.id} value={lens.id}>
                        {lens.name}
                    </option>
                ))}
            </select>
            {activeLens && (
                <span className="lens-info">
                    {[
                        activeLens.author && `@${activeLens.author}`,
                        activeLens.containsText && `"${activeLens.containsText}"`,
                        activeLens.minReactions && `≥${activeLens.minReactions}`,
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </span>
            )}
        </div>
    );
}
