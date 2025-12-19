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





//m
// import { gql } from "@apollo/client";
//
// export const GET_POSTS = gql`
//   query GetPosts {
//     posts {
//       id
//       title
//       content
//       createdAt
//       author {
//         id
//         username
//       }
//     }
//   }
// `;
