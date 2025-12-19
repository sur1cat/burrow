"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_POST } from "@/graphql/mutations/posts";

import PostTypeSelector from "@/components/post/PostTypeSelector";
import PollEditor, { PollData } from "@/components/poll/PollEditor";

import type { PostType } from "@/graphql/mock/posts";

function hoursFromNow(h: number) {
    return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

export default function CreatePostForm() {
    const [type, setType] = useState<PostType>("text");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [poll, setPoll] = useState<PollData | null>(null);

    const [isEphemeral, setIsEphemeral] = useState(false);
    const [ephemeralLifetime, setEphemeralLifetime] =
        useState<"24h" | "7d">("24h");

    const [createPost, { loading }] = useMutation(CREATE_POST, {
        refetchQueries: ["GetPosts"],
    });

    const ephemeralUntil = useMemo(() => {
        if (!isEphemeral) return null;
        return ephemeralLifetime === "24h"
            ? hoursFromNow(24)
            : hoursFromNow(24 * 7);
    }, [isEphemeral, ephemeralLifetime]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) return;
        if (type === "link" && !linkUrl.trim()) return;
        if (type === "image" && !imageUrl.trim()) return;

        if (type === "poll") {
            if (!poll?.question.trim()) return;
            const validOpts = poll.options.map((o) => o.trim()).filter(Boolean);
            if (validOpts.length < 2) return;
        }

        await createPost({
            variables: {
                input: {
                    type,
                    title: title.trim(),
                    content: content.trim(),
                    linkUrl: type === "link" ? linkUrl.trim() : null,
                    imageUrl: type === "image" ? imageUrl.trim() : null,
                    poll:
                        type === "poll" && poll
                            ? {
                                question: poll.question.trim(),
                                options: poll.options
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                            }
                            : null,
                    ephemeralUntil,
                },
            },
        });

        // reset form
        setTitle("");
        setContent("");
        setLinkUrl("");
        setImageUrl("");
        setPoll(null);
        setIsEphemeral(false);
        setEphemeralLifetime("24h");
    };

    return (
        <form onSubmit={handleSubmit} className="card card-padding">
            <div className="form-block">
                <PostTypeSelector value={type} onChange={setType} />
            </div>

            <div className="post-body">
                <input
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                />

                <textarea
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write something..."
                />

                {type === "link" && (
                    <input
                        className="input"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Link URL (https://...)"
                    />
                )}

                {type === "image" && (
                    <input
                        className="input"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL (https://...)"
                    />
                )}

                {type === "poll" && (
                    <PollEditor
                        onChange={(p) => setPoll(p)}
                    />
                )}
            </div>

            <div className="ephemeral-row">
                <label className="ephemeral-label">
                    <input
                        type="checkbox"
                        checked={isEphemeral}
                        onChange={(e) => setIsEphemeral(e.target.checked)}
                    />
                    <span>Ephemeral thread</span>
                </label>

                {isEphemeral && (
                    <select
                        className="input ephemeral-select"
                        value={ephemeralLifetime}
                        onChange={(e) =>
                            setEphemeralLifetime(
                                e.target.value as "24h" | "7d"
                            )
                        }
                    >
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                    </select>
                )}
            </div>

            <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
            >
                {loading ? "Posting…" : "Post"}
            </button>
        </form>
    );
}







//m
// "use client";
//
// import { useMemo, useState } from "react";
// import { mockPosts, PostType, PollData } from "@/graphql/mock/posts";
// import PostTypeSelector from "@/components/post/PostTypeSelector";
// import PollEditor from "@/components/poll/PollEditor";
//
// function hoursFromNow(h: number) {
//     return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
// }
//
// export default function CreatePostForm() {
//     const [type, setType] = useState<PostType>("text");
//     const [title, setTitle] = useState("");
//     const [content, setContent] = useState("");
//
//     const [linkUrl, setLinkUrl] = useState("");
//     const [imageUrl, setImageUrl] = useState("");
//
//     const [poll, setPoll] = useState<PollData | null>(null);
//
//     const [isEphemeral, setIsEphemeral] = useState(false);
//     const [ephemeralLifetime, setEphemeralLifetime] = useState<"24h" | "7d">("24h");
//
//     const ephemeralUntil = useMemo(() => {
//         if (!isEphemeral) return null;
//         return ephemeralLifetime === "24h" ? hoursFromNow(24) : hoursFromNow(24 * 7);
//     }, [isEphemeral, ephemeralLifetime]);
//
//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//
//         if (!title.trim()) return;
//         if (!content.trim()) return;
//
//         // valideer met type
//         if (type === "link" && !linkUrl.trim()) return;
//         if (type === "image" && !imageUrl.trim()) return;
//         if (type === "poll") {
//             if (!poll?.question.trim()) return;
//             const validOpts = (poll.options ?? []).map((o) => o.trim()).filter(Boolean);
//             if (validOpts.length < 2) return;
//         }
//
//         const newPostId = Math.random().toString(16).slice(2);
//
//         mockPosts.unshift({
//             id: newPostId,
//             type,
//             title: title.trim(),
//             content: content.trim(),
//             createdAt: new Date().toISOString(),
//             author: {
//                 id: "you",
//                 username: "You",
//             },
//             reactionsCount: 0,
//             commentsCount: 0,
//             ephemeralUntil,
//             linkUrl: type === "link" ? linkUrl.trim() : null,
//             imageUrl: type === "image" ? imageUrl.trim() : null,
//             poll:
//                 type === "poll" && poll
//                     ? {
//                         question: poll.question.trim(),
//                         options: poll.options
//                             .map((t, idx) => ({ id: String(idx + 1), text: t.trim(), votes: 0 }))
//                             .filter((o) => o.text),
//                     }
//                     : null,
//             tags: [],
//         });
//
//         // Reset
//         setTitle("");
//         setContent("");
//         setLinkUrl("");
//         setImageUrl("");
//         setPoll(null);
//         setIsEphemeral(false);
//         setEphemeralLifetime("24h");
//
//         alert("Post created (mock)");
//     };
//
//     return (
//         <form onSubmit={handleSubmit} className="card card-padding">
//             <div className="form-block">
//                 <PostTypeSelector value={type} onChange={setType} />
//             </div>
//             <div className="post-body">
//                 <input
//                     className="input"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="Title"
//                 />
//
//                 <textarea
//                     className="input"
//                     value={content}
//                     onChange={(e) => setContent(e.target.value)}
//                     placeholder="Write something..."
//                 />
//
//
//
//             {type === "link" && (
//                 <input
//                     className="input"
//                     value={linkUrl}
//                     onChange={(e) => setLinkUrl(e.target.value)}
//                     placeholder="Link URL (https://...)"
//                 />
//             )}
//
//             {type === "image" && (
//                 <input
//                     className="input"
//                     value={imageUrl}
//                     onChange={(e) => setImageUrl(e.target.value)}
//                     placeholder="Image URL (https://...)"
//                 />
//             )}
//
//             {type === "poll" && (
//                 <PollEditor
//                     onChange={(p) => setPoll(p)}
//                 />
//             )}
//             </div>
//             <div className="ephemeral-row">
//                 <label className="ephemeral-label">
//                     <input
//                         type="checkbox"
//                         checked={isEphemeral}
//                         onChange={(e) => setIsEphemeral(e.target.checked)}
//                     />
//                     <span>Ephemeral thread</span>
//                 </label>
//
//                 {isEphemeral && (
//                     <select
//                         className="input ephemeral-select"
//                         value={ephemeralLifetime}
//                         onChange={(e) => setEphemeralLifetime(e.target.value as "24h" | "7d")}
//                     >
//                         <option value="24h">24 hours</option>
//                         <option value="7d">7 days</option>
//                     </select>
//                 )}
//             </div>
//
//             <button type="submit" className="btn btn-primary w-full">
//                 Post
//             </button>
//         </form>
//     );
// }
//
//
//
