"use client";

import { Lens } from "@/graphql/mock/lenses";

export default function LensSelector({
                                         lenses,
                                         activeLensId,
                                         onSelect,
                                     }: {
    lenses: Lens[];
    activeLensId: string | null;
    onSelect: (id: string | null) => void;
}) {
    return (
        <div className="card card-padding space-y-2">
            <p className="text-sm text-gray-600">Choose a lens to filter your feed:</p>

            <div className="flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className={`btn ${activeLensId === null ? "btn-primary" : "btn-secondary"}`}
                >
                    All
                </button>

                {lenses.map((lens) => (
                    <button
                        key={lens.id}
                        type="button"
                        onClick={() => onSelect(lens.id)}
                        className={`btn ${activeLensId === lens.id ? "btn-primary" : "btn-secondary"}`}
                        title={lens.rules.map((r) => `${r.type}`).join(", ")}
                    >
                        {lens.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
