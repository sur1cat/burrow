"use client";

import { useState } from "react";
import { Lens } from "@/store/lens.store";

export default function LensEditor({ onSave }: { onSave: (lens: Lens) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [minReactions, setMinReactions] = useState<number>(0);
    const [author, setAuthor] = useState("");
    const [containsText, setContainsText] = useState("");

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        onSave({
            id: `lens-${Math.random().toString(16).slice(2)}`,
            name: trimmedName,
            author: author.trim() || undefined,
            containsText: containsText.trim() || undefined,
            minReactions: minReactions > 0 ? minReactions : undefined,
        });

        setName("");
        setMinReactions(0);
        setAuthor("");
        setContainsText("");
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="lens-create-btn"
            >
                + Create lens
            </button>
        );
    }

    return (
        <div className="lens-editor">
            <div className="lens-editor-header">
                <span className="lens-editor-title">New Lens</span>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="lens-editor-close"
                >
                    ×
                </button>
            </div>

            <input
                className="input"
                placeholder="Lens name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <div className="lens-editor-fields">
                <input
                    type="number"
                    className="input"
                    placeholder="Min reactions"
                    value={minReactions || ""}
                    min={0}
                    onChange={(e) => setMinReactions(Number(e.target.value))}
                />
                <input
                    className="input"
                    placeholder="Author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
                <input
                    className="input"
                    placeholder="Contains text"
                    value={containsText}
                    onChange={(e) => setContainsText(e.target.value)}
                />
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim()}
                className="btn btn-primary w-full"
            >
                Save Lens
            </button>
        </div>
    );
}
