import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      posts {
        id
        type
        title
        content
        createdAt
        ephemeralUntil
        reactionsCount
        commentsCount
        linkUrl
        imageUrl
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
        author {
          id
          username
        }
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      type
      title
      content
      createdAt
      ephemeralUntil
      reactionsCount
      commentsCount
      linkUrl
      imageUrl
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
      author {
        id
        username
      }
    }
  }
`;
