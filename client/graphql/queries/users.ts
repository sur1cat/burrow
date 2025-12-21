import { gql } from "@apollo/client";

export const GET_ME = gql`
    query GetMe {
        me {
            id
            username
            email
            bio
            avatar
            role
            postsCount
            commentsCount
            createdAt
            posts {
                id
                type
                title
                content
                createdAt
                reactionsCount
                commentsCount
                linkUrl
                imageUrl
                ephemeralUntil
                isSaved
                poll {
                    question
                    options {
                        id
                        text
                        votes
                        hasVoted
                    }
                    totalVotes
                }
            }
            savedPosts {
                id
                type
                title
                content
                createdAt
                reactionsCount
                commentsCount
                linkUrl
                imageUrl
                ephemeralUntil
                isSaved
                author {
                    id
                    username
                }
                poll {
                    question
                    options {
                        id
                        text
                        votes
                        hasVoted
                    }
                    totalVotes
                }
            }
        }
    }
`;

export const GET_USER = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            username
            bio
            avatar
            isOnline
            lastSeen
            postsCount
            commentsCount
            createdAt
            posts {
                id
                type
                title
                content
                createdAt
                reactionsCount
                commentsCount
                linkUrl
                imageUrl
                ephemeralUntil
                isSaved
                poll {
                    question
                    options {
                        id
                        text
                        votes
                        hasVoted
                    }
                    totalVotes
                }
            }
        }
    }
`;

export const GET_USER_BY_USERNAME = gql`
    query GetUserByUsername($username: String!) {
        userByUsername(username: $username) {
            id
            username
            bio
            avatar
            isOnline
            lastSeen
            postsCount
            commentsCount
            createdAt
            posts {
                id
                type
                title
                content
                createdAt
                reactionsCount
                commentsCount
                linkUrl
                imageUrl
                ephemeralUntil
                isSaved
                author {
                    id
                    username
                }
                poll {
                    question
                    options {
                        id
                        text
                        votes
                        hasVoted
                    }
                    totalVotes
                }
            }
        }
    }
`;

export const GET_POSTS_BY_USER = gql`
    query GetPostsByUser($userId: ID!, $limit: Int, $offset: Int) {
        postsByUser(userId: $userId, limit: $limit, offset: $offset) {
            id
            type
            title
            content
            createdAt
            reactionsCount
            commentsCount
            linkUrl
            imageUrl
            ephemeralUntil
            isSaved
            author {
                id
                username
            }
            poll {
                question
                options {
                    id
                    text
                    votes
                    hasVoted
                }
                totalVotes
            }
        }
    }
`;

export const CHECK_USERNAME_AVAILABLE = gql`
    query CheckUsernameAvailable($username: String!) {
        checkUsernameAvailable(username: $username) {
            available
            reason
        }
    }
`;
