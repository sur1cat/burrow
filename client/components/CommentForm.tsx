"use client";

import { useState } from "react";
import { mockComments } from "@/graphql/mock/comments";

export default function CommentForm({ postId }: { postId: string }) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!text.trim()) return;

        mockComments.push({
            id: Math.random().toString(),
            postId,
            text,
            createdAt: new Date().toISOString(),
            author: {
                id: "local-user",
                username: "You",
            },
        });

        setText("");
        alert("Comment added (mock)!");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
            />
            <button
                type="submit"
                className="btn btn-primary w-full"
            >
                Add Comment
            </button>
        </form>
    );
}



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
//       <textarea
//           className="w-full border p-2 rounded"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Write a comment..."
//       />
//             <button
//                 type="submit"
//                 className="w-full bg-blue-500 text-white py-2 rounded"
//             >
//                 Add Comment
//             </button>
//         </form>
//     );
// }





//without mock data
// "use client";
//
// import { gql } from "@apollo/client";
// import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
// import { useState } from "react";
//
// const ADD_COMMENT = gql`
//   mutation AddComment($postId: ID!, $text: String!) {
//     addComment(postId: $postId, text: $text) {
//       id
//       text
//       user {
//         id
//         username
//       }
//     }
//   }
// `;
//
// export default function CommentForm({ postId }: { postId: string }) {
//     const [text, setText] = useState("");
//     const [addComment] = useMutation(ADD_COMMENT);
//
//     async function submit(e: React.FormEvent<HTMLFormElement>) {
//         e.preventDefault();
//         await addComment({ variables: { postId, text } });
//         setText("");
//     }
//
//     return (
//         <form onSubmit={submit} className="flex gap-2 mt-2">
//             <input
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 className="flex-1 p-2 border rounded"
//                 placeholder="Write a comment..."
//             />
//             <button className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
//         </form>
//     );
// }
