import { Lens } from "@/graphql/mock/lenses";
import { MockPost } from "@/graphql/mock/posts";

export function applyLens(posts: MockPost[], lens: Lens | null): MockPost[] {
    if (!lens) return posts;

    return posts.filter((post) => {
        return lens.rules.every((rule) => {
            switch (rule.type) {
                case "minReactions":
                    return post.reactionsCount >= rule.value;

                case "author":
                    return post.author.username === rule.value;

                case "containsText":
                    return post.content.includes(rule.value);

                default:
                    return true;
            }
        });
    });
}
