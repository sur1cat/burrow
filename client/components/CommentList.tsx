"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_COMMENTS } from "@/graphql/queries/comments";
import { COMMENT_ADDED } from "@/graphql/subscriptions/comments";
import { useSubscription } from "@/hooks/useSubscription";

interface CommentAuthor {
    id: string;
    username: string;
}

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: CommentAuthor;
}

interface GetCommentsResponse {
    comments: Comment[];
}

interface CommentAddedResponse {
    commentAdded: Comment;
}

export default function CommentList({ postId }: { postId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);

    const { data, loading } = useQuery<GetCommentsResponse>(GET_COMMENTS, {
        variables: { postId },
    });

    const { data: subscriptionData } = useSubscription<CommentAddedResponse>(
        COMMENT_ADDED,
        { variables: { postId } }
    );

    useEffect(() => {
        if (data?.comments) {
            setComments(data.comments);
        }
    }, [data]);

    useEffect(() => {
        if (subscriptionData?.commentAdded) {
            const newComment = subscriptionData.commentAdded;
            setComments((prev) => {
                if (prev.some((c) => c.id === newComment.id)) {
                    return prev;
                }
                return [...prev, newComment];
            });
        }
    }, [subscriptionData]);

    if (loading) {
        return <p className="text-sm text-slate-500">Loading comments…</p>;
    }

    if (comments.length === 0) {
        return <p className="text-sm text-slate-500">No comments yet.</p>;
    }

    return (
        <div className="space-y-4">
            {comments.map((c) => (
                <div key={c.id} className="card card-padding">
                    <p className="text-sm">{c.text}</p>
                    <p className="text-xs text-slate-500">
                        by {c.author.username} at{" "}
                        {new Date(c.createdAt).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
