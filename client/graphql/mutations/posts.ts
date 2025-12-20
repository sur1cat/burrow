import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        username
      }
      createdAt
      ephemeralUntil
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $text: String!) {
    addComment(postId: $postId, text: $text) {
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

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($targetType: ReactionTarget!, $targetId: ID!, $type: ReactionType!) {
    toggleReaction(targetType: $targetType, targetId: $targetId, type: $type)
  }
`;

export const CREATE_LENS = gql`
  mutation CreateLens($input: CreateLensInput!) {
    createLens(input: $input) {
      id
      name
      description
      rules {
        type
        value
      }
      isPublic
    }
  }
`;

export const VOTE_POLL = gql`
  mutation VotePoll($postId: ID!, $optionId: String!) {
    votePoll(postId: $postId, optionId: $optionId) {
      id
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

export const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId)
  }
`;

export const UNSAVE_POST = gql`
  mutation UnsavePost($postId: ID!) {
    unsavePost(postId: $postId)
  }
`;

export const HEARTBEAT = gql`
  mutation Heartbeat {
    heartbeat
  }
`;
