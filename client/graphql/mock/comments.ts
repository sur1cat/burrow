// graphql/mock/comments.ts

export interface MockComment {
    id: string;
    postId: string;
    text: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
    };
}

export const mockComments: MockComment[] = [
    {
        id: "101",
        postId: "1",
        text: "This is a mock comment for testing.",
        createdAt: new Date().toISOString(),
        author: {
            id: "u5",
            username: "CommenterOne",
        },
    },
    {
        id: "102",
        postId: "1",
        text: "Another example comment.",
        createdAt: new Date().toISOString(),
        author: {
            id: "u6",
            username: "CommenterTwo",
        },
    },
];
