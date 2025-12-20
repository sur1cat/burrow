"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import { GET_POST } from "@/graphql/queries/posts";
import { TOGGLE_REACTION } from "@/graphql/mutations/posts";

interface ThreadPageProps {
    params: Promise<{
        id: string;
    }>;
}

interface PostData {
    post: {
        id: string;
        type: string;
        title: string;
        content: string;
        createdAt: string;
        reactionsCount: number;
        commentsCount: number;
        linkUrl?: string;
        imageUrl?: string;
        poll?: {
            question: string;
            options: Array<{
                id: string;
                text: string;
                votes: number;
                hasVoted?: boolean;
            }>;
            totalVotes?: number;
        };
        author: {
            id: string;
            username: string;
        };
    } | null;
}

function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

export default function ThreadPage({ params }: ThreadPageProps) {
    const { id } = use(params);

    const { data, loading, error } = useQuery<PostData>(GET_POST, {
        variables: { id },
    });

    const [votes, setVotes] = useState(0);
    const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
    const [toggleReaction] = useMutation(TOGGLE_REACTION);

    const post = data?.post;

    if (post && votes === 0 && post.reactionsCount > 0) {
        setVotes(post.reactionsCount);
    }

    const handleUpvote = async () => {
        const wasUpvoted = voteState === "up";
        const newState = wasUpvoted ? null : "up";
        const voteChange = wasUpvoted ? -1 : (voteState === "down" ? 2 : 1);

        setVoteState(newState);
        setVotes(prev => prev + voteChange);

        try {
            await toggleReaction({
                variables: {
                    targetType: "post",
                    targetId: id,
                    type: "like"
                }
            });
        } catch {
            setVoteState(voteState);
            setVotes(post?.reactionsCount ?? 0);
        }
    };

    const handleDownvote = () => {
        const wasDownvoted = voteState === "down";
        const newState = wasDownvoted ? null : "down";
        const voteChange = wasDownvoted ? 1 : (voteState === "up" ? -2 : -1);

        setVoteState(newState);
        setVotes(prev => prev + voteChange);
    };

    return (
        <div className="thread-container">
            <Link href="/feed" className="action-btn mb-4" style={{ display: "inline-flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Feed
            </Link>

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            )}

            {error && (
                <div className="card card-padding">
                    <p style={{ color: "var(--red-primary)" }}>Error loading post</p>
                </div>
            )}

            {post && (
                <>
                    <article className="post-card">
                        <div className="vote-sidebar">
                            <button
                                className={`vote-btn ${voteState === "up" ? "upvoted" : ""}`}
                                onClick={handleUpvote}
                                aria-label="Upvote"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4L3 15h6v5h6v-5h6L12 4z" />
                                </svg>
                            </button>
                            <span className={`vote-count ${voteState === "up" ? "upvoted" : voteState === "down" ? "downvoted" : ""}`}>
                                {votes || post.reactionsCount}
                            </span>
                            <button
                                className={`vote-btn ${voteState === "down" ? "downvoted" : ""}`}
                                onClick={handleDownvote}
                                aria-label="Downvote"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 20l9-11h-6V4H9v5H3l9 11z" />
                                </svg>
                            </button>
                        </div>

                        <div className="post-content" style={{ padding: "12px" }}>
                            <div className="post-meta">
                                <span className="post-author">u/{post.author.username}</span>
                                <span className="post-dot">•</span>
                                <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                            </div>

                            <h1 className="post-title" style={{ fontSize: "22px", marginBottom: "16px" }}>
                                {post.title}
                            </h1>

                            <div className="post-body" style={{ marginBottom: "16px" }}>
                                {post.content}
                            </div>

                            {post.type === "link" && post.linkUrl && (
                                <a
                                    href={post.linkUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="post-link"
                                    style={{ marginBottom: "16px" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    {post.linkUrl}
                                </a>
                            )}

                            {post.type === "image" && post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="post-image"
                                    style={{ marginBottom: "16px" }}
                                />
                            )}

                            <div className="post-actions">
                                <span className="action-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    {post.commentsCount} Comments
                                </span>
                                <button className="action-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="18" cy="5" r="3" />
                                        <circle cx="6" cy="12" r="3" />
                                        <circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                    Share
                                </button>
                                <button className="action-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        </div>
                    </article>

                    <div className="comment-form">
                        <p className="comment-form-title">Comment as user</p>
                        <CommentForm postId={id} />
                    </div>

                    <div className="card card-padding mt-4">
                        <CommentList postId={id} />
                    </div>
                </>
            )}
        </div>
    );
}
