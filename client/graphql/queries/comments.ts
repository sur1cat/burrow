import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($postId: ID!) {
    comments(postId: $postId) {
      id
      text
      createdAt
      author {
        id
        username
      }
    }
  }
`;
