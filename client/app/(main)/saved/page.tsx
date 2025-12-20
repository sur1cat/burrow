"use client";

import type { PostCardPost } from "@/components/PostCard";

import PostList from "@/components/PostList";
import ProtectedRoute from "@/components/ProtectedRoute";

import { useQuery } from "@apollo/client/react";
import { GET_ME } from "@/graphql/queries/users";

function mapPostToPostCard(post: any): PostCardPost {
    return {
        id: post.id,
        type: post.type as PostCardPost["type"],
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        ephemeralUntil: post.ephemeralUntil ?? null,
        reactionsCount: post.reactionsCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        author: {
            id: post.author.id,
            username: post.author.username,
        },
        linkUrl: post.linkUrl,
        imageUrl: post.imageUrl,
        poll: post.poll,
    };
}

interface SavedPostsResponse {
    me: {
        savedPosts: any[];
    };
}

function SavedPostsContent() {
    const { data, loading, error } = useQuery<SavedPostsResponse>(GET_ME);

    const savedPosts: PostCardPost[] = (data?.me?.savedPosts ?? []).map(mapPostToPostCard);

    return (
        <div className="main-content">
            <div className="feed-container">
                <div className="card card-padding mb-4">
                    <h1 className="text-xl font-bold">Saved Posts</h1>
                    <p className="text-sm text-muted mt-2">
                        Posts you&apos;ve saved for later
                    </p>
                </div>

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                )}

                {error && (
                    <div className="card card-padding">
                        <p className="text-sm" style={{ color: "var(--red-primary)" }}>
                            Failed to load saved posts.
                        </p>
                        <p className="text-sm text-muted mt-2">{error.message}</p>
                    </div>
                )}

                {!loading && !error && savedPosts.length === 0 && (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">🔖</div>
                            <h3 className="empty-state-title">No saved posts</h3>
                            <p className="empty-state-text">
                                Posts you save will appear here
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && <PostList posts={savedPosts} />}
            </div>

            <aside className="sidebar">
                <div className="sidebar-card">
                    <div className="sidebar-header">
                        About Saved Posts
                    </div>
                    <div className="sidebar-content">
                        <p className="text-sm">
                            Save posts to read them later. Click the bookmark icon on any post to save it.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default function SavedPostsPage() {
    return (
        <ProtectedRoute>
            <SavedPostsContent />
        </ProtectedRoute>
    );
}
