"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ReactionButton from "@/components/ReactionButton";
import type { MockPost, PollOption } from "@/graphql/mock/posts";

export type PostCardPost = MockPost;

function formatTimeLeft(ms: number) {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function PollRenderer({ options }: { options: PollOption[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const totalVotes = useMemo(
        () => options.reduce((sum, o) => sum + o.votes, 0),
        [options]
    );

    return (
        <div className="space-y-2">
            {options.map((opt) => {
                const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedId(opt.id)}
                        className={`poll-option ${
                            selectedId === opt.id ? "active" : ""
                        }`}
                    >

                    <div className="flex items-center justify-between">
                            <span className="font-medium">{opt.text}</span>
                            <span className="text-sm text-gray-600">{pct}%</span>
                        </div>
                        <div className="text-xs text-gray-500">{opt.votes} votes</div>
                    </button>
                );
            })}
            {selectedId && (
                <p className="text-xs text-gray-600">
                    Selected option: <span className="font-medium">{selectedId}</span> (mock — not persisted)
                </p>
            )}
        </div>
    );
}

export default function PostCard({ post }: { post: PostCardPost }) {
    const createdAt = new Date(post.createdAt).toLocaleString();

    const { isEphemeral, isArchived, badgeText } = useMemo(() => {
        if (!post.ephemeralUntil) {
            return { isEphemeral: false, isArchived: false, badgeText: null as string | null };
        }
        const untilMs = new Date(post.ephemeralUntil).getTime();
        const nowMs = Date.now();
        const diff = untilMs - nowMs;

        if (diff <= 0) {
            return { isEphemeral: true, isArchived: true, badgeText: "Archived" };
        }
        return { isEphemeral: true, isArchived: false, badgeText: `Expires in ${formatTimeLeft(diff)}` };
    }, [post.ephemeralUntil]);

    return (
        <article className={`card card-padding space-y-3 ${isArchived ? "opacity-60" : ""}`}>
            <header className="flex items-start justify-between gap-4">
                <div className="post-author">
                    <p className="post-author-name">{post.author.username}</p>
                    <p className="post-author-date">{createdAt}</p>
                </div>


                <div className="post-t">
                    <h2 className="post-title">{post.title}</h2>
                    {isEphemeral && badgeText && (
                        <span className="ephemeral-badge">
              {badgeText}
            </span>
                    )}
                </div>
            </header>

            <p className="text-sm whitespace-pre-wrap">{post.content}</p>

            {/* Post type rendering */}
            {post.type === "link" && post.linkUrl && (
                <a
                    className="text-blue-600 hover:underline break-all"
                    href={post.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    {post.linkUrl}
                </a>
            )}

            {post.type === "image" && post.imageUrl && (
                // Using img for mock change later
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full rounded border"
                />
            )}

            {post.type === "poll" && post.poll && (
                <div className="poll-block">
                    <div className="poll">
                        <p className="font-semibold">{post.poll.question}</p>
                        <PollRenderer options={post.poll.options} />
                    </div>
                </div>
            )}


            <footer className="post-footer">
                <div className="post-meta">
                    <ReactionButton count={post.reactionsCount} ariaLabel="Like post" />
                    <span className="post-comments">
                        {post.commentsCount} comments
                    </span>
                </div>


                {isArchived ? (
                    <span className="text-gray-500 text-sm">Thread archived</span>
                ) : (
                    <Link href={`/thread/${post.id}`} className="text-blue-600 hover:underline text-sm">
                        View thread
                    </Link>
                )}
            </footer>
        </article>
    );
}




//w/o epipheral
// "use client";
//
// import Link from "next/link";
// import ReactionButton from "./ReactionButton";
//
// export default function PostCard({ post, onReact }: any) {
//     const createdAt = new Date(post.createdAt).toLocaleString();
//
//     return (
//         <article className="card card-padding space-y-2">
//             <header className="flex items-center justify-between gap-4">
//                 <div>
//                     <p className="font-semibold">{post.author.username}</p>
//                     <p className="text-xs text-slate-500">{createdAt}</p>
//                 </div>
//                 {post.title && (
//                     <h2 className="font-bold text-lg">{post.title}</h2>
//                 )}
//             </header>
//
//             <p className="text-sm whitespace-pre-wrap">{post.content}</p>
//
//             <footer className="flex items-center justify-between text-sm pt-2">
//                 <div className="flex items-center gap-2">
//                     <ReactionButton
//                         count={post.reactionsCount ?? 0}
//                         ariaLabel="Like post"
//                         onClick={onReact}
//                     />
//                     <span className="text-slate-500">
//                         {post.commentsCount ?? 0} comments
//                     </span>
//                 </div>
//
//                 <Link
//                     href={`/thread/${post.id}`}
//                     className="text-green-700 hover:underline text-sm"
//                 >
//                     View thread
//                 </Link>
//             </footer>
//         </article>
//     );
// }




//without styling
// "use client";
//
// import Link from "next/link";
// import ReactionButton from "./ReactionButton";
//
// export interface PostAuthor {
//     id: string;
//     username: string;
//     avatarUrl?: string | null;
// }
//
// export interface PostCardPost {
//     id: string;
//     title?: string | null;
//     content: string;
//     createdAt: string;
//     author: PostAuthor;
//     reactionsCount?: number;
//     commentsCount?: number;
// }
//
// export interface PostCardProps {
//     post: PostCardPost;
//     onReact?: () => void;
// }
//
//
// export default function PostCard({ post, onReact }: PostCardProps) {
//     const createdAt = new Date(post.createdAt).toLocaleString();
//
//     return (
//         <article className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
//             <header className="flex items-center justify-between gap-4">
//                 <div>
//                     <p className="font-semibold">{post.author.username}</p>
//                     <p className="text-xs text-gray-500">{createdAt}</p>
//                 </div>
//                 {post.title && (
//                     <h2 className="font-bold text-lg">{post.title}</h2>
//                 )}
//             </header>
//
//             <p className="text-sm whitespace-pre-wrap">{post.content}</p>
//
//             <footer className="flex items-center justify-between text-sm pt-2">
//                 <div className="flex items-center gap-2">
//                     <ReactionButton
//                         count={post.reactionsCount ?? 0}
//                         ariaLabel="Like post"
//                         onClick={onReact}
//                     />
//                     <span className="text-gray-500">
//             {post.commentsCount ?? 0} comments
//           </span>
//                 </div>
//                 <Link
//                     href={`/thread/${post.id}`}
//                     className="text-blue-600 hover:underline text-sm"
//                 >
//                     View thread
//                 </Link>
//             </footer>
//         </article>
//     );
// }
