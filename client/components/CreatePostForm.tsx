"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_POST } from "@/graphql/mutations/posts";
import PollEditor, { PollData } from "@/components/poll/PollEditor";
import ImageUpload from "@/components/ImageUpload";
import type { PostType } from "@/graphql/mock/posts";

function hoursFromNow(h: number) {
    return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

const POST_TYPES = [
    { id: "text", label: "Post", icon: "📝" },
    { id: "image", label: "Image", icon: "🖼️" },
    { id: "link", label: "Link", icon: "🔗" },
    { id: "poll", label: "Poll", icon: "📊" },
] as const;

export default function CreatePostForm() {
    const [type, setType] = useState<PostType>("text");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [poll, setPoll] = useState<PollData | null>(null);
    const [isEphemeral, setIsEphemeral] = useState(false);
    const [ephemeralLifetime, setEphemeralLifetime] = useState<"24h" | "7d">("24h");

    const [createPost, { loading }] = useMutation(CREATE_POST, {
        refetchQueries: ["GetPosts"],
    });

    const ephemeralUntil = useMemo(() => {
        if (!isEphemeral) return null;
        return ephemeralLifetime === "24h" ? hoursFromNow(24) : hoursFromNow(24 * 7);
    }, [isEphemeral, ephemeralLifetime]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim()) return;
        if (type === "link" && !linkUrl.trim()) return;
        if (type === "image" && !imageUrl.trim()) return;

        if (type === "poll") {
            if (!poll?.question.trim()) return;
            const validOpts = poll.options.map((o) => o.trim()).filter(Boolean);
            if (validOpts.length < 2) return;
        }

        await createPost({
            variables: {
                input: {
                    type,
                    title: title.trim(),
                    content: content.trim() || title.trim(),
                    linkUrl: type === "link" ? linkUrl.trim() : null,
                    imageUrl: type === "image" ? imageUrl : null,
                    poll:
                        type === "poll" && poll
                            ? {
                                question: poll.question.trim(),
                                options: poll.options
                                    .map((t) => ({ text: t.trim() }))
                                    .filter((o) => o.text),
                            }
                            : null,
                    ephemeralUntil,
                },
            },
        });

        setTitle("");
        setContent("");
        setLinkUrl("");
        setImageUrl("");
        setPoll(null);
        setIsEphemeral(false);
        setEphemeralLifetime("24h");
    };

    return (
        <form onSubmit={handleSubmit} className="create-form">
            <div className="create-form-tabs">
                {POST_TYPES.map((pt) => (
                    <button
                        key={pt.id}
                        type="button"
                        onClick={() => setType(pt.id as PostType)}
                        className={`create-tab ${type === pt.id ? "active" : ""}`}
                    >
                        <span>{pt.icon}</span>
                        {pt.label}
                    </button>
                ))}
            </div>

            <div className="create-form-body">
                <input
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />

                <textarea
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                        type === "text"
                            ? "What's on your mind?"
                            : type === "link"
                            ? "Description (optional)"
                            : type === "image"
                            ? "Caption (optional)"
                            : "Poll description"
                    }
                    rows={3}
                />

                {type === "link" && (
                    <input
                        className="input"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                    />
                )}

                {type === "image" && (
                    <ImageUpload
                        onImageSelect={setImageUrl}
                        currentImage={imageUrl}
                    />
                )}

                {type === "poll" && <PollEditor onChange={(p) => setPoll(p)} />}
            </div>

            <div className="create-form-footer">
                <label className="ephemeral-toggle">
                    <input
                        type="checkbox"
                        checked={isEphemeral}
                        onChange={(e) => setIsEphemeral(e.target.checked)}
                    />
                    <span>Ephemeral</span>
                    {isEphemeral && (
                        <select
                            className="ephemeral-select"
                            value={ephemeralLifetime}
                            onChange={(e) => setEphemeralLifetime(e.target.value as "24h" | "7d")}
                        >
                            <option value="24h">24h</option>
                            <option value="7d">7d</option>
                        </select>
                    )}
                </label>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !title.trim()}
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </form>
    );
}
