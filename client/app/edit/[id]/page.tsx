"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GET_POST } from "@/graphql/queries/posts";
import { UPDATE_POST } from "@/graphql/mutations/posts";
import { useAuthStore } from "@/store/auth.store";

interface EditPageProps {
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
        linkUrl?: string;
        imageUrl?: string;
        author: {
            id: string;
            username: string;
        };
    } | null;
}

export default function EditPostPage({ params }: EditPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const user = useAuthStore((s) => s.user);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");

    const { data, loading: queryLoading } = useQuery<PostData>(GET_POST, {
        variables: { id },
    });

    const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST);

    const post = data?.post;

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setLinkUrl(post.linkUrl || "");
            setImageUrl(post.imageUrl || "");
        }
    }, [post]);

    useEffect(() => {
        if (post && user && post.author.id !== user.id) {
            router.push("/feed");
        }
    }, [post, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        try {
            await updatePost({
                variables: {
                    id,
                    input: {
                        title: title.trim(),
                        content: content.trim(),
                        linkUrl: linkUrl.trim() || null,
                        imageUrl: imageUrl.trim() || null,
                    },
                },
            });
            router.push(`/thread/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update post");
        }
    };

    if (queryLoading) {
        return (
            <div className="page-container">
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="page-container">
                <div className="card card-padding">
                    <p>Post not found</p>
                </div>
            </div>
        );
    }

    if (!user || post.author.id !== user.id) {
        return (
            <div className="page-container">
                <div className="card card-padding">
                    <p>You can only edit your own posts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Link href={`/thread/${id}`} className="action-btn mb-4" style={{ display: "inline-flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Post
            </Link>

            <div className="card">
                <div className="card-padding">
                    <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Edit Post</h1>

                    {error && (
                        <div className="auth-error" style={{ marginBottom: "16px" }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-block">
                            <label className="input-label">Title</label>
                            <input
                                type="text"
                                className="input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title"
                            />
                        </div>

                        <div className="form-block">
                            <label className="input-label">Content</label>
                            <textarea
                                className="input"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Post content"
                                rows={6}
                            />
                        </div>

                        {post.type === "link" && (
                            <div className="form-block">
                                <label className="input-label">Link URL</label>
                                <input
                                    type="url"
                                    className="input"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>
                        )}

                        {post.type === "image" && (
                            <div className="form-block">
                                <label className="input-label">Image URL</label>
                                <input
                                    type="url"
                                    className="input"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => router.push(`/thread/${id}`)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateLoading}
                            >
                                {updateLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
