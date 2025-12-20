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
