"use client";

import { mockComments } from "@/graphql/mock/comments";

export default function CommentList({ postId }: { postId: string }) {
    const comments = mockComments.filter((c) => c.postId === postId);

    if (comments.length === 0) {
        return <p className="text-sm text-slate-500">No comments yet.</p>;
    }

    return (
        <div className="space-y-4">
            {comments.map((c) => (
                <div key={c.id} className="card card-padding">
                    <p className="text-sm">{c.text}</p>
                    <p className="text-xs text-slate-500">
                        by {c.author.username} at{" "}
                        {new Date(c.createdAt).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}




// "use client";
//
// import { mockComments } from "@/graphql/mock/comments";
//
// export default function CommentList({ postId }: { postId: string }) {
//     const comments = mockComments.filter((c) => c.postId === postId);
//
//     if (comments.length === 0) {
//         return <p className="text-sm text-gray-500">No comments yet.</p>;
//     }
//
//     return (
//         <div className="space-y-4">
//             {comments.map((c) => (
//                 <div key={c.id} className="bg-white border p-3 rounded shadow-sm">
//                     <p className="text-sm">{c.text}</p>
//                     <p className="text-xs text-gray-500">
//                         by {c.author.username} at{" "}
//                         {new Date(c.createdAt).toLocaleString()}
//                     </p>
//                 </div>
//             ))}
//         </div>
//     );
// }
//
//





//without mock data
// "use client";
//
// import { gql } from "@apollo/client";
// import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
//
// const GET_COMMENTS = gql`
//   query GetComments($postId: ID!) {
//     comments(postId: $postId) {
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
// const COMMENT_SUB = gql`
//   subscription OnComment($postId: ID!) {
//     commentAdded(postId: $postId) {
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
// export default function CommentList({ postId }: { postId: string }) {
//     const { data, loading } = useQuery(GET_COMMENTS, { variables: { postId } });
//
//     useSubscription(COMMENT_SUB, {
//         variables: { postId },
//         onData: ({ client, data }: { client: any; data: any }) => {
//             const newComment = data.data.commentAdded;
//             client.cache.modify({
//                 fields: {
//                     comments(existing = []) {
//                         return [...existing, newComment];
//                     },
//                 },
//             });
//         },
//     });
//
//     if (loading) return <p>Loading…</p>;
//
//     return (
//         <div>
//             {data.comments.map((c) => (
//                 <div key={c.id} className="p-2 border-b">
//                     <strong>{c.user.username}</strong>: {c.text}
//                 </div>
//             ))}
//         </div>
//     );
// }
