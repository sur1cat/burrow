"use client";

import { useState } from "react";
import { Lens, LensRule } from "@/graphql/mock/lenses";

export default function LensEditor({ onSave }: { onSave: (lens: Lens) => void }) {
    const [name, setName] = useState("");
    const [minReactions, setMinReactions] = useState<number>(0);
    const [author, setAuthor] = useState("");
    const [containsText, setContainsText] = useState("");

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const rules: LensRule[] = [];

        if (minReactions > 0) rules.push({ type: "minReactions", value: minReactions });
        if (author.trim()) rules.push({ type: "author", value: author.trim() });
        if (containsText.trim()) rules.push({ type: "containsText", value: containsText.trim() });

        onSave({
            id: `lens-${Math.random().toString(16).slice(2)}`,
            name: trimmedName,
            rules,
        });

        // reset
        setName("");
        setMinReactions(0);
        setAuthor("");
        setContainsText("");
    };

    return (
        <div className="card card-padding space-y-3">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Create Lens</h3>
                <p className="text-sm text-gray-600">
                    A lens is a saved filter for your feed. Fill any rules you want.
                </p>
            </div>

            <input
                className="input"
                placeholder="Lens name (required)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Min reactions</label>
                    <input
                        type="number"
                        className="input"
                        value={minReactions}
                        min={0}
                        onChange={(e) => setMinReactions(Number(e.target.value))}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Author username</label>
                    <input
                        className="input"
                        placeholder='e.g. "Alice"'
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Contains text</label>
                    <input
                        className="input"
                        placeholder='e.g. "@you"'
                        value={containsText}
                        onChange={(e) => setContainsText(e.target.value)}
                    />
                </div>
            </div>

            <div className="lens-actions">
                <button type="button" onClick={handleSave} className="btn btn-primary w-full">
                    Save Lens
                </button>
            </div>

        </div>
    );
}
