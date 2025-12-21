"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GET_USER_BY_USERNAME } from "@/graphql/queries/users";
import { useAuthStore } from "@/store/auth.store";
import PostCard from "@/components/PostCard";
import OnlineIndicator from "@/components/OnlineIndicator";

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const currentUser = useAuthStore((s) => s.user);

    const { data, loading, error } = useQuery<{
        userByUsername: {
            id: string;
            username: string;
            bio?: string;
            avatar?: string;
            isOnline: boolean;
            lastSeen?: string;
            postsCount: number;
            commentsCount: number;
            createdAt: string;
            posts: Array<{
                id: string;
                type: string;
                title: string;
                content: string;
                createdAt: string;
                reactionsCount: number;
                commentsCount: number;
                linkUrl?: string;
                imageUrl?: string;
                ephemeralUntil?: string;
                isSaved?: boolean;
                author: { id: string; username: string };
                poll?: {
                    question: string;
                    options: { id: string; text: string; votes: number; hasVoted: boolean }[];
                    totalVotes: number;
                };
            }>;
        };
    }>(GET_USER_BY_USERNAME, {
        variables: { username },
        skip: !username,
    });

    const getInitial = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="loading-spinner-container">
                        <div className="loading-spinner" />
                        <p className="text-muted mt-4">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.userByUsername) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>User not found</h2>
                        <p className="text-muted">The user u/{username} doesn't exist or has been deleted.</p>
                        <Link href="/feed" className="btn btn-primary mt-4">
                            Back to Feed
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const user = data.userByUsername;
    const isOwnProfile = currentUser?.username === user.username;
    const posts = user.posts || [];

    return (
        <div className="page-container">
            <div className="card" style={{ overflow: "hidden" }}>
                <div className="profile-header">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="profile-avatar-img"
                        />
                    ) : (
                        <div className="profile-avatar">
                            {getInitial(user.username)}
                        </div>
                    )}

                    <h1 className="profile-name">{user.username}</h1>
                    <p className="profile-username">u/{user.username}</p>
                    <div style={{ marginTop: "8px" }}>
                        <OnlineIndicator isOnline={user.isOnline} lastSeen={user.lastSeen} />
                    </div>

                    {user.bio && (
                        <p className="profile-bio">{user.bio}</p>
                    )}
                </div>

                <div className="profile-content">
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <div className="profile-stat-value">{user.postsCount ?? 0}</div>
                            <div className="profile-stat-label">Posts</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{user.commentsCount ?? 0}</div>
                            <div className="profile-stat-label">Comments</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">0</div>
                            <div className="profile-stat-label">Karma</div>
                        </div>
                    </div>

                    {user.createdAt && (
                        <div className="profile-member-since">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}

                    {isOwnProfile && (
                        <div className="profile-actions-row">
                            <Link href="/profile" className="btn btn-secondary">
                                Edit Your Profile
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-posts">
                <h2 className="profile-posts-title">
                    {isOwnProfile ? "Your Posts" : `Posts by ${user.username}`}
                </h2>

                {posts.length > 0 ? (
                    <div className="feed-posts">
                        {posts.map((post: {
                            id: string;
                            type: string;
                            title: string;
                            content: string;
                            createdAt: string;
                            reactionsCount: number;
                            commentsCount: number;
                            linkUrl?: string;
                            imageUrl?: string;
                            ephemeralUntil?: string;
                            isSaved?: boolean;
                            author: { id: string; username: string };
                            poll?: {
                                question: string;
                                options: { id: string; text: string; votes: number; hasVoted: boolean }[];
                                totalVotes: number;
                            };
                        }) => (
                            <PostCard
                                key={post.id}
                                post={{
                                    ...post,
                                    type: post.type as "text" | "image" | "link" | "poll",
                                    isSaved: post.isSaved ?? false,
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <h3>No posts yet</h3>
                            <p className="text-muted">
                                {isOwnProfile
                                    ? "You haven't created any posts yet."
                                    : `${user.username} hasn't posted anything yet.`}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
