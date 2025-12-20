import { Lens } from "@/store/lens.store";
import { PostCardPost } from "@/components/PostCard";

export function applyLens(
    posts: PostCardPost[],
    lens: Lens | null
): PostCardPost[] {
    if (!lens) return posts;

    const {
        author,
        containsText,
        minReactions,
    } = lens;

    let result = [...posts];

    if (author) {
        result = result.filter(
            (p) => p.author.username === author
        );
    }

    if (containsText) {
        const q = containsText.toLowerCase();
        result = result.filter(
            (p) =>
                p.title?.toLowerCase().includes(q) ||
                p.content?.toLowerCase().includes(q)
        );
    }

    if (typeof minReactions === "number") {
        result = result.filter(
            (p) => (p.reactionsCount ?? 0) >= minReactions
        );
    }

    return result;
}
