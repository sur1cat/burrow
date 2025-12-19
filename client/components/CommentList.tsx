"use client";

import { useQuery } from "@apollo/client/react";
import { GET_COMMENTS } from "@/graphql/queries/comments";

interface CommentAuthor {
    id: string;
    username: string;
}

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: CommentAuthor;
}

interface GetCommentsResponse {
    comments: Comment[];
}

export default function CommentList({ postId }: { postId: string }) {
    const { data, loading } = useQuery<GetCommentsResponse>(GET_COMMENTS, {
        variables: { postId },
    });

    if (loading) {
        return <p className="text-sm text-slate-500">Loading comments…</p>;
    }

    if (!data || data.comments.length === 0) {
        return <p className="text-sm text-slate-500">No comments yet.</p>;
    }

    return (
        <div className="space-y-4">
            {data.comments.map((c) => (
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





//m
// "use client";
//
// import { mockComments } from "@/graphql/mock/comments";
//
// export default function CommentList({ postId }: { postId: string }) {
//     const comments = mockComments.filter((c) => c.postId === postId);
//
//     if (comments.length === 0) {
//         return <p className="text-sm text-slate-500">No comments yet.</p>;
//     }
//
//     return (
//         <div className="space-y-4">
//             {comments.map((c) => (
//                 <div key={c.id} className="card card-padding">
//                     <p className="text-sm">{c.text}</p>
//                     <p className="text-xs text-slate-500">
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
