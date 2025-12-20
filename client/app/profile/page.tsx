"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { GET_ME } from "@/graphql/queries/users";
import { UPDATE_PROFILE, CHANGE_PASSWORD } from "@/graphql/mutations/users";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const logout = useAuthStore((s) => s.logout);

    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState(user?.username || "");
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const { data } = useQuery<{
        me: {
            id: string;
            username: string;
            email: string;
            bio?: string;
            avatar?: string;
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
                poll?: {
                    question: string;
                    options: { id: string; text: string; votes: number; hasVoted: boolean }[];
                    totalVotes: number;
                };
            }>;
        };
    }>(GET_ME);

    useEffect(() => {
        if (data?.me) {
            setEditUsername(data.me.username);
            setEditBio(data.me.bio || "");
            setEditAvatar(data.me.avatar || "");
            setAvatarPreview(data.me.avatar || null);
        }
    }, [data]);

    const [updateProfile, { loading: updating }] = useMutation<{
        updateProfile: {
            id: string;
            username: string;
            email: string;
            bio?: string;
            avatar?: string;
        };
    }>(UPDATE_PROFILE, {
        refetchQueries: [{ query: GET_ME }],
    });

    const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        try {
            await changePassword({
                variables: {
                    input: {
                        currentPassword,
                        newPassword,
                    },
                },
            });
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess(false);
            }, 2000);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : "Failed to change password");
        }
    };

    const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be less than 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAvatarPreview(base64);
            setEditAvatar(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleSaveProfile = async () => {
        try {
            const result = await updateProfile({
                variables: {
                    input: {
                        username: editUsername.trim() || undefined,
                        bio: editBio.trim() || undefined,
                        avatar: editAvatar || undefined,
                    },
                },
            });
            if (result?.data?.updateProfile) {
                setUser({
                    id: result.data.updateProfile.id,
                    username: result.data.updateProfile.username,
                    email: result.data.updateProfile.email,
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handleCancelEdit = () => {
        setEditUsername(data?.me?.username || user?.username || "");
        setEditBio(data?.me?.bio || "");
        setEditAvatar(data?.me?.avatar || "");
        setAvatarPreview(data?.me?.avatar || null);
        setIsEditing(false);
    };

    const getInitial = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    const profileData = data?.me ?? null;
    const posts = data?.me?.posts || [];
    const displayUser = profileData || user;

    return (
        <ProtectedRoute>
            <div className="page-container">
                <div className="card" style={{ overflow: "hidden" }}>
                    <div className="profile-header">
                        {isEditing ? (
                            <div className="avatar-upload" onClick={() => fileInputRef.current?.click()}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                    style={{ display: "none" }}
                                />
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="profile-avatar-img"
                                    />
                                ) : (
                                    <div className="profile-avatar">
                                        {getInitial(editUsername || user?.username)}
                                    </div>
                                )}
                                <div className="avatar-upload-overlay">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <>
                                {profileData?.avatar ? (
                                    <img
                                        src={profileData.avatar}
                                        alt={displayUser?.username || ""}
                                        className="profile-avatar-img"
                                    />
                                ) : (
                                    <div className="profile-avatar">
                                        {getInitial(displayUser?.username)}
                                    </div>
                                )}
                            </>
                        )}

                        {isEditing ? (
                            <input
                                type="text"
                                className="input profile-name-input"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Username"
                            />
                        ) : (
                            <h1 className="profile-name">
                                {displayUser?.username ?? "Anonymous"}
                            </h1>
                        )}

                        <p className="profile-username">
                            u/{isEditing ? editUsername : (displayUser?.username ?? "unknown")}
                        </p>

                        {isEditing ? (
                            <textarea
                                className="input profile-bio-input"
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        ) : (
                            profileData?.bio && (
                                <p className="profile-bio">{profileData.bio}</p>
                            )
                        )}
                    </div>

                    <div className="profile-content">
                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{profileData?.postsCount ?? 0}</div>
                                <div className="profile-stat-label">Posts</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{profileData?.commentsCount ?? 0}</div>
                                <div className="profile-stat-label">Comments</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">0</div>
                                <div className="profile-stat-label">Karma</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted">Email</label>
                                <p className="text-primary">{displayUser?.email ?? "Not set"}</p>
                            </div>
                            {profileData?.createdAt && (
                                <div>
                                    <label className="text-sm text-muted">Member since</label>
                                    <p className="text-primary">
                                        {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="password-section">
                            {!showPasswordForm ? (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="btn btn-secondary"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <div className="password-form">
                                    <h3 className="password-form-title">Change Password</h3>
                                    {passwordError && (
                                        <div className="password-error">{passwordError}</div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="password-success">Password changed successfully!</div>
                                    )}
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <div className="password-form-actions">
                                        <button
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordError("");
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleChangePassword}
                                            className="btn btn-primary"
                                            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        >
                                            {changingPassword ? "Saving..." : "Update Password"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-actions-row">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="btn btn-secondary"
                                        disabled={updating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="btn btn-primary"
                                        disabled={updating}
                                    >
                                        {updating ? "Saving..." : "Save Changes"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-secondary"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-danger"
                                    >
                                        Log Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {posts.length > 0 && (
                    <div className="profile-posts">
                        <h2 className="profile-posts-title">Your Posts</h2>
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
                                        author: {
                                            id: profileData?.id || displayUser?.id || "",
                                            username: displayUser?.username || "",
                                        },
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
