"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { VOTE_POLL, TOGGLE_REACTION, SAVE_POST, UNSAVE_POST } from "@/graphql/mutations/posts";
import { getSeenPostsFilter } from "@/lib/bloom-filter";

export interface PollOption {
    id: string;
    text: string;
    votes: number;
    hasVoted?: boolean;
}

export interface Poll {
    question: string;
    options: PollOption[];
    totalVotes?: number;
}

export interface PostCardPost {
    id: string;
    type?: "text" | "image" | "link" | "poll";
    title?: string;
    content?: string;
    createdAt: string;
    ephemeralUntil?: string | null;
    author: {
        id: string;
        username: string;
    };
    reactionsCount?: number;
    commentsCount?: number;
    linkUrl?: string;
    imageUrl?: string;
    poll?: Poll;
}

function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
}

function formatTimeLeft(ms: number) {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function PollRenderer({ postId, poll }: { postId: string; poll: Poll }) {
    const [votePoll, { loading }] = useMutation(VOTE_POLL);
    const [localOptions, setLocalOptions] = useState(poll.options);
    const [votedId, setVotedId] = useState<string | null>(
        poll.options.find(o => o.hasVoted)?.id ?? null
    );

    const totalVotes = useMemo(
        () => localOptions.reduce((sum, o) => sum + o.votes, 0),
        [localOptions]
    );

    const handleVote = async (optionId: string) => {
        if (votedId || loading) return;

        setVotedId(optionId);
        setLocalOptions(prev =>
            prev.map(o =>
                o.id === optionId ? { ...o, votes: o.votes + 1, hasVoted: true } : o
            )
        );

        try {
            await votePoll({
                variables: { postId, optionId },
            });
        } catch (error) {
            setVotedId(null);
            setLocalOptions(poll.options);
            console.error("Failed to vote:", error);
        }
    };

    return (
        <div className="poll-container">
            <p className="poll-question">{poll.question}</p>
            <div className="poll-options">
                {localOptions.map((opt) => {
                    const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    const isVoted = votedId === opt.id;

                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVote(opt.id)}
                            disabled={!!votedId || loading}
                            className={`poll-option ${isVoted ? "selected" : ""} ${votedId ? "voted" : ""}`}
                        >
                            {votedId && (
                                <div
                                    className="poll-option-bar"
                                    style={{ width: `${pct}%` }}
                                />
                            )}
                            <div className="poll-option-content">
                                <span className="poll-option-text">{opt.text}</span>
                                {votedId && (
                                    <span className="poll-option-percent">{pct}%</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            <p className="poll-footer">{totalVotes} votes</p>
        </div>
    );
}

export default function PostCard({ post }: { post: PostCardPost }) {
    const [votes, setVotes] = useState(post.reactionsCount ?? 0);
    const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);
    const [isSeen, setIsSeen] = useState(false);
    const [toggleReaction] = useMutation(TOGGLE_REACTION);
    const [savePostMutation] = useMutation(SAVE_POST);
    const [unsavePostMutation] = useMutation(UNSAVE_POST);

    useEffect(() => {
        const bloomFilter = getSeenPostsFilter();
        if (bloomFilter.mightContain(post.id)) {
            setIsSeen(true);
        }
    }, [post.id]);

    const markAsSeen = () => {
        if (!isSeen) {
            const bloomFilter = getSeenPostsFilter();
            bloomFilter.add(post.id);
            setIsSeen(true);
        }
    };

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
                    targetId: post.id,
                    type: "like"
                }
            });
        } catch {
            setVoteState(voteState);
            setVotes(post.reactionsCount ?? 0);
        }
    };

    const handleDownvote = async () => {
        const wasDownvoted = voteState === "down";
        const newState = wasDownvoted ? null : "down";
        const voteChange = wasDownvoted ? 1 : (voteState === "up" ? -2 : -1);

        setVoteState(newState);
        setVotes(prev => prev + voteChange);

        try {
            await toggleReaction({
                variables: {
                    targetType: "post",
                    targetId: post.id,
                    type: "dislike"
                }
            });
        } catch {
            setVoteState(voteState);
            setVotes(post.reactionsCount ?? 0);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/thread/${post.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.content?.slice(0, 100),
                    url,
                });
            } catch {
            }
        } else {
            await navigator.clipboard.writeText(url);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        }
    };

    const handleSave = async () => {
        const wasSaved = isSaved;
        setIsSaved(!wasSaved);

        try {
            if (wasSaved) {
                await unsavePostMutation({ variables: { postId: post.id } });
            } else {
                await savePostMutation({ variables: { postId: post.id } });
            }
        } catch {
            setIsSaved(wasSaved);
        }
    };

    const { isEphemeral, badgeText } = useMemo(() => {
        if (!post.ephemeralUntil) {
            return { isEphemeral: false, badgeText: null as string | null };
        }

        const untilMs = new Date(post.ephemeralUntil).getTime();
        const nowMs = Date.now();
        const diff = untilMs - nowMs;

        if (diff <= 0) {
            return { isEphemeral: true, badgeText: "Expired" };
        }

        return { isEphemeral: true, badgeText: `${formatTimeLeft(diff)}` };
    }, [post.ephemeralUntil]);

    return (
        <article className={`post-card ${isSeen ? "post-seen" : ""}`}>
            <div className="vote-sidebar">
                <button
                    className={`vote-btn ${voteState === "up" ? "upvoted" : ""}`}
                    onClick={handleUpvote}
                    aria-label="Upvote"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4L3 15h6v5h6v-5h6L12 4z" />
                    </svg>
                </button>
                <span className={`vote-count ${voteState === "up" ? "upvoted" : voteState === "down" ? "downvoted" : ""}`}>
                    {votes}
                </span>
                <button
                    className={`vote-btn ${voteState === "down" ? "downvoted" : ""}`}
                    onClick={handleDownvote}
                    aria-label="Downvote"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l9-11h-6V4H9v5H3l9 11z" />
                    </svg>
                </button>
            </div>

            <div className="post-content">
                <div className="post-meta">
                    <Link href={`/user/${post.author.username}`} className="post-author">
                        u/{post.author.username}
                    </Link>
                    <span className="post-dot">•</span>
                    <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                    {isEphemeral && badgeText && (
                        <>
                            <span className="post-dot">•</span>
                            <span className="post-flair flair-ephemeral">{badgeText}</span>
                        </>
                    )}
                    {post.type === "poll" && (
                        <>
                            <span className="post-dot">•</span>
                            <span className="post-flair flair-poll">Poll</span>
                        </>
                    )}
                </div>

                <h3 className="post-title">
                    <Link href={`/thread/${post.id}`} onClick={markAsSeen}>{post.title}</Link>
                </h3>

                {post.content && post.content !== post.title && (
                    <p className="post-body truncated">{post.content}</p>
                )}

                {post.type === "link" && post.linkUrl && (
                    <a
                        className="post-link"
                        href={post.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        {new URL(post.linkUrl).hostname}
                    </a>
                )}

                {post.type === "image" && post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="post-image" />
                )}

                {post.type === "poll" && post.poll && (
                    <PollRenderer postId={post.id} poll={post.poll} />
                )}

                <div className="post-actions">
                    <Link href={`/thread/${post.id}`} className="action-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {post.commentsCount ?? 0}
                    </Link>
                    <button className="action-btn" onClick={handleShare}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share
                    </button>
                    <button
                        className={`action-btn ${isSaved ? "active" : ""}`}
                        onClick={handleSave}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isSaved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        {isSaved ? "Saved" : "Save"}
                    </button>
                </div>
            </div>

            {showShareToast && (
                <div className="toast toast-success">
                    Link copied to clipboard!
                </div>
            )}
        </article>
    );
}
