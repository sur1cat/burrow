"use client";

import type { PostCardPost } from "@/components/PostCard";

import ProtectedRoute from "@/components/ProtectedRoute";
import CreatePostForm from "@/components/CreatePostForm";
import PostList from "@/components/PostList";
import LensSelector from "@/components/lens/LensSelector";
import LensEditor from "@/components/lens/LensEditor";

import { useLensStore } from "@/store/lens.store";
import { applyLens } from "@/lib/lens-utils";

import { useQuery } from "@apollo/client/react";
import { GET_POSTS } from "@/graphql/queries/posts";



//m
function mapPostToPostCard(post: any): PostCardPost {
    return {
        id: post.id,
        type: post.type as PostCardPost["type"],
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        ephemeralUntil: post.ephemeralUntil ?? null,
        reactionsCount: post.reactionsCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        author: {
            id: post.author.id,
            username: post.author.username,
        },
        linkUrl: post.linkUrl,
        imageUrl: post.imageUrl,
        poll: post.poll,
    };
}



//m
interface PostAuthor {
    id: string;
    username: string;
}

interface Post {
    id: string;
    type?: string;
    title?: string;
    content?: string;
    createdAt: string;
    ephemeralUntil?: string | null;
    reactionsCount?: number;
    commentsCount?: number;
    author: PostAuthor;
}

interface GetPostsResponse {
    posts: {
        posts: Post[];
        totalCount: number;
        hasMore: boolean;
    };
}


export default function FeedPage() {
    // lens state
    const { lenses, activeLensId, setActiveLens, addLens } = useLensStore();

    const activeLens =
        lenses.find((l) => l.id === activeLensId) ?? null;

    // real backend query
    const { data, loading, error } = useQuery<GetPostsResponse>(GET_POSTS, {
        variables: { limit: 20, offset: 0 },
    });


    // // backend shape: posts.posts
    // const posts = data?.posts?.posts ?? [];
    //m
    const rawPosts = data?.posts?.posts ?? [];
    const posts: PostCardPost[] = rawPosts.map(mapPostToPostCard);


    // apply lens filtering client-side
    const filteredPosts = applyLens(posts, activeLens);

    return (
        <ProtectedRoute>
            <div className="page-container space-y-4">
                <CreatePostForm />

                <LensSelector
                    lenses={lenses}
                    activeLensId={activeLensId}
                    onSelect={setActiveLens}
                />

                <LensEditor onSave={addLens} />

                {loading && (
                    <div className="card card-padding">
                        <p className="text-sm text-gray-600">Loading posts…</p>
                    </div>
                )}

                {error && (
                    <div className="card card-padding">
                        <p className="text-sm text-red-600">
                            Failed to load posts.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {error.message}
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <PostList posts={filteredPosts} />
                )}
            </div>
        </ProtectedRoute>
    );
}




//m
// "use client";
//
// import ProtectedRoute from "@/components/ProtectedRoute";
// import CreatePostForm from "@/components/CreatePostForm";
// import PostList from "@/components/PostList";
// import LensSelector from "@/components/lens/LensSelector";
// import LensEditor from "@/components/lens/LensEditor";
//
// import { mockPosts } from "@/graphql/mock/posts";
// import { useLensStore } from "@/store/lens.store";
// import { applyLens } from "@/lib/lens-utils";
//
// export default function FeedPage() {
//     //lens
//     const { lenses, activeLensId, setActiveLens, addLens } = useLensStore();
//
//     const activeLens =
//         lenses.find((l) => l.id === activeLensId) ?? null;
//
//     const filteredPosts = applyLens(mockPosts, activeLens);
//
//     return (
//         <ProtectedRoute>
//             <div className="page-container space-y-4">
//                 <CreatePostForm />
//
//                 <LensSelector
//                     lenses={lenses}
//                     activeLensId={activeLensId}
//                     onSelect={setActiveLens}
//                 />
//
//                 <LensEditor onSave={addLens} />
//
//                 <PostList posts={filteredPosts} />
//             </div>
//         </ProtectedRoute>
//     );
// }
//
