# Frontend Requirements & Integration Guide

This document outlines the changes needed in the frontend to fully integrate with the backend API.

## Current State

The frontend currently uses **mock data** for most functionality. The following files contain mock implementations that need to be replaced with real API calls:

- `graphql/mock/posts.ts` - Mock posts data
- `graphql/mock/comments.ts` - Mock comments data
- `graphql/mock/lenses.ts` - Mock lenses data
- `components/CreatePostForm.tsx` - Uses mock data directly
- `components/ReactionButton.tsx` - Local state only, no API

## Required Changes

### 1. Apollo Client Setup (High Priority)

**File**: `lib/apollo-client.ts`

Update to include:
- WebSocket link for subscriptions
- Authentication header with JWT token
- Split link for HTTP/WS

```typescript
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP || "http://localhost:4000/graphql",
});

const wsLink = typeof window !== "undefined" ? new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS || "ws://localhost:4000/graphql",
    connectionParams: () => ({
      authorization: `Bearer ${localStorage.getItem("token")}`,
    }),
  })
) : null;

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = typeof window !== "undefined" && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### 2. GraphQL Queries (Update Required)

**File**: `graphql/queries/posts.ts`

Add missing queries:

```typescript
export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      type
      title
      content
      author { id username avatar }
      linkUrl
      imageUrl
      poll {
        question
        options { id text votes hasVoted }
        totalVotes
        endsAt
      }
      tags
      reactionsCount
      commentsCount
      ephemeralUntil
      hasReacted
      userReactionType
      createdAt
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int, $filter: PostFilterInput) {
    posts(limit: $limit, offset: $offset, filter: $filter) {
      posts {
        id
        type
        title
        content
        author { id username avatar }
        reactionsCount
        commentsCount
        ephemeralUntil
        createdAt
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      bio
      avatar
      role
    }
  }
`;
```

### 3. GraphQL Mutations (Add Missing)

**File**: `graphql/mutations/posts.ts`

Add/update mutations:

```typescript
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      type
      title
      content
      author { id username }
      createdAt
      ephemeralUntil
    }
  }
`;

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($targetType: ReactionTarget!, $targetId: ID!, $type: ReactionType!) {
    toggleReaction(targetType: $targetType, targetId: $targetId, type: $type)
  }
`;

export const VOTE_POLL = gql`
  mutation VotePoll($postId: ID!, $optionId: String!) {
    votePoll(postId: $postId, optionId: $optionId) {
      id
      poll {
        options { id text votes hasVoted }
        totalVotes
      }
    }
  }
`;
```

### 4. Components to Update

#### CreatePostForm.tsx
- Replace mock data manipulation with `useMutation(CREATE_POST)`
- Get user from auth context instead of hardcoded "You"

#### PostList.tsx / PostCard.tsx
- Use `useQuery(GET_POSTS)` instead of mock data
- Handle loading/error states

#### ReactionButton.tsx
- Use `useMutation(TOGGLE_REACTION)` instead of local state
- Add optimistic UI updates

#### CommentList.tsx / CommentForm.tsx
- Implement `useSubscription(COMMENT_ADDED)` for real-time comments
- Replace mock data with `useQuery(GET_COMMENTS)`

### 5. New Components Needed

#### Profile Page Enhancement
The current profile page needs:
- Display user's posts (`GET_POSTS_BY_USER` query)
- Edit profile form (`UPDATE_PROFILE` mutation)
- User statistics (posts count, comments count)

#### Poll Voting Component
Create a component for poll voting:
```typescript
// components/poll/PollVote.tsx
- Display poll options with vote counts
- Handle voting with VOTE_POLL mutation
- Show if user has already voted
- Display poll end time
```

#### Lens Management
Create components for lens CRUD:
```typescript
// components/lens/LensManager.tsx
- List user's lenses
- Create/Edit/Delete lenses
- Apply lens to filter posts
```

### 6. Auth Integration

#### Update Auth Store
The `store/auth.store.ts` should persist token and handle:
- Store JWT token from login/register
- Clear token on logout
- Provide token for Apollo Client auth header

#### Protected Routes
Update `components/ProtectedRoute.tsx`:
- Use `GET_ME` query to verify authentication
- Handle token expiration
- Redirect to login when unauthenticated

### 7. Real-time Subscriptions

#### Comment Subscription (Required for project)
```typescript
// In thread/[id]/page.tsx or CommentList.tsx
const { data: newComment } = useSubscription(COMMENT_ADDED, {
  variables: { postId },
  onData: ({ data }) => {
    // Add new comment to cache
    cache.modify({
      fields: {
        comments(existingComments = []) {
          return [...existingComments, data.data.commentAdded];
        }
      }
    });
  }
});
```

### 8. Environment Variables

Create/update `.env.local`:
```env
NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS=ws://localhost:4000/graphql
```

### 9. Package Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "graphql-ws": "^5.14.3",
    "@apollo/client": "^3.8.0"
  }
}
```

## Priority Order

1. **Critical** - Apollo Client with auth headers
2. **Critical** - Auth flow (login/register using real mutations)
3. **High** - Posts list from API
4. **High** - Create post with API
5. **High** - Comments with subscription (required for realtime demo)
6. **Medium** - Reactions
7. **Medium** - Poll voting
8. **Low** - Lens management
9. **Low** - Profile editing

## Testing Checklist

After implementing changes, verify:

- [ ] User can register and receive JWT
- [ ] User can login and receive JWT
- [ ] Protected routes redirect unauthenticated users
- [ ] Posts load from API
- [ ] User can create new posts
- [ ] Comments load for a post
- [ ] User can add comments
- [ ] **Real-time**: New comments appear without refresh
- [ ] Reactions update correctly
- [ ] Poll voting works

## Notes

- The backend API is fully functional and tested
- All GraphQL queries/mutations/subscriptions are documented in the schema
- Test credentials: `test@example.com` / `test123`
- Run `npm run seed` in server to populate test data
