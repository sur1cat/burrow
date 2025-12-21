"use client";

import type { PostCardPost } from "@/components/PostCard";

import CreatePostForm from "@/components/CreatePostForm";
import PostList from "@/components/PostList";
import LensSelector from "@/components/lens/LensSelector";
import LensEditor from "@/components/lens/LensEditor";

import { useLensStore } from "@/store/lens.store";
import { applyLens } from "@/lib/lens-utils";
import { useAuthStore } from "@/store/auth.store";

import { useQuery } from "@apollo/client/react";
import { GET_POSTS } from "@/graphql/queries/posts";

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
        isSaved: post.isSaved ?? false,
    };
}

interface PostAuthor {
    id: string;
    username: string;
}

interface Post {
    id: string;
    type?: string;
    title?: string;
    content?: string;
    createdAt: string;
    ephemeralUntil?: string | null;
    reactionsCount?: number;
    commentsCount?: number;
    author: PostAuthor;
}

interface GetPostsResponse {
    posts: {
        posts: Post[];
        totalCount: number;
        hasMore: boolean;
    };
}

export default function FeedPage() {
    const user = useAuthStore((s) => s.user);
    const { lenses, activeLensId, setActiveLens, addLens } = useLensStore();

    const activeLens = lenses.find((l) => l.id === activeLensId) ?? null;

    const { data, loading, error } = useQuery<GetPostsResponse>(GET_POSTS, {
        variables: { limit: 20, offset: 0 },
    });

    const rawPosts = data?.posts?.posts ?? [];
    const posts: PostCardPost[] = rawPosts.map(mapPostToPostCard);
    const filteredPosts = applyLens(posts, activeLens);

    return (
        <div className="main-content">
            <div className="feed-container">
                {user && <CreatePostForm />}

                <div className="card card-padding">
                    <div className="flex items-center justify-between gap-4">
                        <LensSelector
                            lenses={lenses}
                            activeLensId={activeLensId}
                            onSelect={setActiveLens}
                        />
                        <LensEditor onSave={addLens} />
                    </div>
                </div>

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                )}

                {error && (
                    <div className="card card-padding">
                        <p className="text-sm" style={{ color: "var(--red-primary)" }}>
                            Failed to load posts.
                        </p>
                        <p className="text-sm text-muted mt-2">{error.message}</p>
                    </div>
                )}

                {!loading && !error && filteredPosts.length === 0 && (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3 className="empty-state-title">No posts yet</h3>
                            <p className="empty-state-text">
                                Be the first to share something with the community!
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && <PostList posts={filteredPosts} />}
            </div>

            <aside className="sidebar">
                <div className="sidebar-card">
                    <div className="sidebar-header">
                        About Burrow
                    </div>
                    <div className="sidebar-content">
                        <p className="text-sm mb-4">
                            Welcome to Burrow! A place to share ideas, discuss topics, and connect with others.
                        </p>
                        <div className="flex gap-4 mb-4">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{data?.posts?.totalCount ?? 0}</div>
                                <div className="profile-stat-label">Posts</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{lenses.length}</div>
                                <div className="profile-stat-label">Lenses</div>
                            </div>
                        </div>
                        {!user && (
                            <a href="/register" className="btn btn-primary w-full">
                                Join Community
                            </a>
                        )}
                    </div>
                </div>

                <div className="sidebar-card">
                    <div className="sidebar-header">
                        Community Rules
                    </div>
                    <ul className="sidebar-rules">
                        <li>
                            <strong>1. Be respectful</strong>
                            <span>Treat others as you would like to be treated.</span>
                        </li>
                        <li>
                            <strong>2. No spam</strong>
                            <span>Don&apos;t post repetitive or promotional content.</span>
                        </li>
                        <li>
                            <strong>3. Stay on topic</strong>
                            <span>Keep discussions relevant to the post.</span>
                        </li>
                        <li>
                            <strong>4. No hate speech</strong>
                            <span>Discrimination will not be tolerated.</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center text-sm text-muted">
                    <p>Burrow &copy; 2024</p>
                    <p className="mt-2">
                        Built with Next.js, GraphQL & MongoDB
                    </p>
                </div>
            </aside>
        </div>
    );
}
