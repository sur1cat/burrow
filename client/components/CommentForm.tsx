"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_COMMENT } from "@/graphql/mutations/posts";
import { useAuthStore } from "@/store/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CommentForm({ postId }: { postId: string }) {
    const [text, setText] = useState("");
    const user = useAuthStore((s) => s.user);
    const { requireAuth } = useRequireAuth();
    const [addComment, { loading }] = useMutation(ADD_COMMENT);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            await addComment({
                variables: { postId, text: text.trim() },
            });
            setText("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    if (!user) {
        return (
            <button
                type="button"
                className="btn btn-outline w-full"
                onClick={() => requireAuth(() => {})}
            >
                Sign up to comment
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
            />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Sending…" : "Add Comment"}
            </button>
        </form>
    );
}
