"use client";

import { useState } from "react";

export interface PollData {
    question: string;
    options: string[];
}

export default function PollEditor({
                                       onChange,
                                   }: {
    onChange: (poll: PollData) => void;
}) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);

    const updateOption = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
        onChange({ question, options: updated });
    };

    return (
        <div className="poll-editor">
            <input
                className="input"
                placeholder="Poll question"
                value={question}
                onChange={(e) => {
                    setQuestion(e.target.value);
                    onChange({ question: e.target.value, options });
                }}
            />

            {options.map((opt, i) => (
                <input
                    key={i}
                    className="input"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                />
            ))}

            <button
                type="button"
                onClick={() => setOptions([...options, ""])}
                className="poll-add-option"
            >
                + Add option
            </button>
        </div>
    );

}
