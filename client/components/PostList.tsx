import PostCard, { PostCardPost } from "@/components/PostCard";

export interface PostListProps {
    posts: PostCardPost[];
}

export default function PostList({ posts }: PostListProps) {
    if (!posts.length) {
        return (
            <div className="card card-padding">
                <p className="text-sm text-gray-600">No posts match this lens.</p>
            </div>
        );
    }

    return (
        <div className="post-list">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}






//w/o epipheral
// import PostCard from "./PostCard";
//
// export default function PostList({ posts, onReactToPost }: any) {
//     if (!posts.length) {
//         return (
//             <p className="text-sm text-slate-500">
//                 No posts yet. Be the first to post!
//             </p>
//         );
//     }
//
//     return (
//         <div className="space-y-4">
//             {posts.map((post: any) => (
//                 <PostCard
//                     key={post.id}
//                     post={post}
//                     onReact={onReactToPost ? () => onReactToPost(post.id) : undefined}
//                 />
//             ))}
//         </div>
//     );
// }

















//w/o styling
// import PostCard, { PostCardPost } from "./PostCard";
//
// export interface PostListProps {
//     posts: PostCardPost[];
//     onReactToPost?: (postId: string) => void;
// }
//
// export default function PostList({ posts, onReactToPost }: PostListProps) {
//     if (!posts.length) {
//         return (
//             <p className="text-sm text-gray-500">
//                 No posts yet. Be the first to post!
//             </p>
//         );
//     }
//
//     return (
//         <div className="space-y-4">
//             {posts.map((post) => (
//                 <PostCard
//                     key={post.id}
//                     post={post}
//                     onReact={onReactToPost ? () => onReactToPost(post.id) : undefined}
//                 />
//             ))}
//         </div>
//     );
// }
