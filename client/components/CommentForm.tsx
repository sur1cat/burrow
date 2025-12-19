"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ADD_COMMENT } from "@/graphql/mutations/posts";

export default function CommentForm({ postId }: { postId: string }) {
    const [text, setText] = useState("");
    const [addComment, { loading }] = useMutation(ADD_COMMENT);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        await addComment({
            variables: { postId, text: text.trim() },
        });

        setText("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
            />
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Sending…" : "Add Comment"}
            </button>
        </form>
    );
}












//m
// "use client";
//
// import { useState } from "react";
// import { mockComments } from "@/graphql/mock/comments";
//
// export default function CommentForm({ postId }: { postId: string }) {
//     const [text, setText] = useState("");
//
//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//
//         if (!text.trim()) return;
//
//         mockComments.push({
//             id: Math.random().toString(),
//             postId,
//             text,
//             createdAt: new Date().toISOString(),
//             author: {
//                 id: "local-user",
//                 username: "You",
//             },
//         });
//
//         setText("");
//         alert("Comment added (mock)!");
//     };
//
//     return (
//         <form onSubmit={handleSubmit} className="space-y-2">
//             <textarea
//                 className="input"
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Write a comment..."
//             />
//             <button
//                 type="submit"
//                 className="btn btn-primary w-full"
//             >
//                 Add Comment
//             </button>
//         </form>
//     );
// }
//
//
