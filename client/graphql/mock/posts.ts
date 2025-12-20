export type PostType = "text" | "link" | "image" | "poll";

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface PollData {
    question: string;
    options: PollOption[];
}

export interface MockPost {
    id: string;
    type: PostType;
    title: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
    };
    reactionsCount: number;
    commentsCount: number;
    ephemeralUntil?: string | null;
    linkUrl?: string | null;
    imageUrl?: string | null;
    poll?: PollData | null;
    tags?: string[];
}

const nowIso = () => new Date().toISOString();

export const mockPosts: MockPost[] = [
    {
        id: "1",
        type: "text",
        title: "Welcome to the Feed",
        content: "This is a mock post. Replace mock data with real backend once available. @you",
        createdAt: nowIso(),
        author: { id: "u1", username: "Alice" },
        reactionsCount: 3,
        commentsCount: 2,
        ephemeralUntil: null,
        tags: ["intro"],
    },
    {
        id: "2",
        type: "link",
        title: "Interesting link",
        content: "Check this out!",
        linkUrl: "https://example.com",
        createdAt: nowIso(),
        author: { id: "u2", username: "Bob" },
        reactionsCount: 1,
        commentsCount: 0,
        ephemeralUntil: null,
        tags: ["link"],
    },
    {
        id: "3",
        type: "poll",
        title: "Quick micropoll",
        content: "Vote below (mock UI).",
        createdAt: nowIso(),
        author: { id: "u3", username: "MockAlice" },
        reactionsCount: 2,
        commentsCount: 1,
        ephemeralUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        poll: {
            question: "Which feature is coolest?",
            options: [
                { id: "a", text: "Topic Lenses", votes: 4 },
                { id: "b", text: "Ephemeral Threads", votes: 2 },
                { id: "c", text: "Live Comments", votes: 1 },
            ],
        },
        tags: ["poll"],
    },
];
