import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
      createdAt
      author {
        id
        username
      }
    }
  }
`;
