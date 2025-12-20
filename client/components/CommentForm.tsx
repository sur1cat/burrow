"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_COMMENT } from "@/graphql/mutations/posts";
import { GET_COMMENTS } from "@/graphql/queries/comments";

export default function CommentForm({ postId }: { postId: string }) {
    const [text, setText] = useState("");
    const [addComment, { loading }] = useMutation(ADD_COMMENT, {
        refetchQueries: [{ query: GET_COMMENTS, variables: { postId } }],
    });

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
