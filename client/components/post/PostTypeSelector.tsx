"use client";

export type PostType = "text" | "link" | "image" | "poll";

export default function PostTypeSelector({
                                             value,
                                             onChange,
                                         }: {
    value: PostType;
    onChange: (type: PostType) => void;
}) {
    const types: PostType[] = ["text", "link", "image", "poll"];

    return (
        <div className="post-type-group">
            {types.map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => onChange(type)}
                    className={`post-type-btn ${
                        value === type ? "active" : ""
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
    );
}
