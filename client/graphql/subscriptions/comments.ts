import { gql } from "@apollo/client";

export const COMMENT_ADDED = gql`
  subscription CommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      text
      author {
        id
        username
      }
      createdAt
    }
  }
`;
