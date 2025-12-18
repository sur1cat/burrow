"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CreatePostForm from "@/components/CreatePostForm";
import PostList from "@/components/PostList";
import LensSelector from "@/components/lens/LensSelector";
import LensEditor from "@/components/lens/LensEditor";

import { mockPosts } from "@/graphql/mock/posts";
import { useLensStore } from "@/store/lens.store";
import { applyLens } from "@/lib/lens-utils";

export default function FeedPage() {
    //lens
    const { lenses, activeLensId, setActiveLens, addLens } = useLensStore();

    const activeLens =
        lenses.find((l) => l.id === activeLensId) ?? null;

    const filteredPosts = applyLens(mockPosts, activeLens);

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

                <PostList posts={filteredPosts} />
            </div>
        </ProtectedRoute>
    );
}




// "use client";
//
// import ProtectedRoute from "@/components/ProtectedRoute";
// import CreatePostForm from "@/components/CreatePostForm";
// import PostList from "@/components/PostList";
// import { mockPosts } from "@/graphql/mock/posts";
//
// export default function FeedPage() {
//     return (
//         <ProtectedRoute>
//             <div className="max-w-xl mx-auto p-4 space-y-4">
//                 <CreatePostForm />
//                 <PostList posts={mockPosts} />
//             </div>
//         </ProtectedRoute>
//     );
// }



//without mock data
// import ProtectedRoute from "@/components/ProtectedRoute";
// import CreatePostForm from "@/components/CreatePostForm";
//
// export default function FeedPage() {
//     return (
//         <ProtectedRoute>
//             <div className="max-w-xl mx-auto p-4">
//                 <CreatePostForm />
//
//                 {/* posts would be listed here */}
//             </div>
//         </ProtectedRoute>
//     );
// }
//
//
//
//
//
// //"use client";
// //
// // import { useQuery } from "@apollo/client/react"; // <- fixed
// // import { GET_POSTS } from "@/graphql/queries/posts";
// // import ThreadCard from "@/components/thread/ThreadCard";
// //
// // export default function FeedPage() {
// //     const { data, loading, error } = useQuery(GET_POSTS);
// //
// //     if (loading) return <p className="p-8">Loading...</p>;
// //     if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>;
// //
// //     // @ts-ignore
// //     const posts = data.posts;
// //
// //     return (
// //         <main className="p-8">
// //             <h1 className="text-3xl font-bold mb-6">Feed</h1>
// //             <div className="space-y-4">
// //                 {posts.map((post: any) => (
// //                     <ThreadCard key={post.id} post={post} />
// //                 ))}
// //             </div>
// //         </main>
// //     );
// // }