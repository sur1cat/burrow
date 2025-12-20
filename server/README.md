# Burrow Server

GraphQL API server for Burrow - a Reddit-like social platform.

## Tech Stack

- **Node.js** - Runtime
- **Express** - HTTP server
- **Apollo Server** - GraphQL server
- **MongoDB** - Database
- **Mongoose** - ODM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **graphql-ws** - WebSocket subscriptions
- **Zod** - Validation
- **Jest** - Testing

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Docker)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env`:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://admin:password@localhost:27017/burrow?authSource=admin
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Development

```bash
npm run dev
```

Server runs at http://localhost:4000/graphql

### Production Build

```bash
npm run build
npm start
```

### Seed Database

```bash
npm run seed
```

Creates test users:
- `test@example.com` / `test123`
- `alice@example.com` / `password123` (admin)

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts          # Environment config
│   │   └── database.ts       # MongoDB connection
│   │
│   ├── graphql/
│   │   ├── schema/
│   │   │   └── typeDefs.ts   # GraphQL schema
│   │   ├── resolvers/
│   │   │   ├── index.ts      # Resolver aggregator
│   │   │   ├── auth.resolver.ts
│   │   │   ├── post.resolver.ts
│   │   │   ├── comment.resolver.ts
│   │   │   ├── lens.resolver.ts
│   │   │   ├── reaction.resolver.ts
│   │   │   └── user.resolver.ts
│   │   ├── context.ts        # GraphQL context
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── index.ts
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   ├── Comment.ts
│   │   ├── Lens.ts
│   │   └── Reaction.ts
│   │
│   ├── utils/
│   │   ├── auth.ts           # JWT utilities
│   │   ├── errors.ts         # Custom errors
│   │   ├── validators.ts     # Zod schemas
│   │   └── username-bloom-filter.ts
│   │
│   ├── tests/
│   │   ├── setup.ts          # Jest setup
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── index.ts              # Entry point
│   └── seed.ts               # Database seeder
│
├── package.json
├── tsconfig.json
├── jest.config.js
└── Dockerfile
```

## API

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /graphql` | GraphQL API |
| `WS /graphql` | WebSocket subscriptions |

### GraphQL Schema

#### Types

```graphql
type User {
  id: ID!
  username: String!
  email: String!
  bio: String
  avatar: String
  role: UserRole!
  isOnline: Boolean!
  lastSeen: DateTime
  posts: [Post!]
  savedPosts: [Post!]
  postsCount: Int!
  commentsCount: Int!
}

type Post {
  id: ID!
  type: PostType!
  title: String!
  content: String!
  author: User!
  linkUrl: String
  imageUrl: String
  poll: Poll
  tags: [String!]!
  reactionsCount: Int!
  commentsCount: Int!
  ephemeralUntil: DateTime
  hasReacted: Boolean
  userReactionType: ReactionType
}

type Comment {
  id: ID!
  post: Post!
  author: User!
  text: String!
  parentComment: Comment
  depth: Int!
  reactionsCount: Int!
  replies: [Comment!]
}

type Lens {
  id: ID!
  name: String!
  description: String
  rules: [LensRule!]!
  author: User!
  isPublic: Boolean!
  pinned: Boolean!
}
```

#### Queries

```graphql
type Query {
  me: User
  user(id: ID!): User
  userByUsername(username: String!): User
  users(limit: Int, offset: Int): [User!]!
  checkUsernameAvailable(username: String!): UsernameAvailability!

  posts(limit: Int, offset: Int, filter: PostFilterInput): PaginatedPosts!
  post(id: ID!): Post
  postsByUser(userId: ID!, limit: Int, offset: Int): [Post!]!

  comments(postId: ID!): [Comment!]!
  comment(id: ID!): Comment

  lenses: [Lens!]!
  lens(id: ID!): Lens
  myLenses: [Lens!]!
  publicLenses: [Lens!]!
}
```

#### Mutations

```graphql
type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  updateProfile(input: UpdateProfileInput!): User!
  changePassword(input: ChangePasswordInput!): Boolean!
  deleteAccount: DeleteResult!

  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): DeleteResult!
  votePoll(postId: ID!, optionId: String!): Post!

  addComment(postId: ID!, text: String!, parentCommentId: ID): Comment!
  updateComment(id: ID!, text: String!): Comment!
  deleteComment(id: ID!): DeleteResult!

  createLens(input: CreateLensInput!): Lens!
  updateLens(id: ID!, input: UpdateLensInput!): Lens!
  deleteLens(id: ID!): DeleteResult!

  toggleReaction(targetType: ReactionTarget!, targetId: ID!, type: ReactionType!): Boolean!
  savePost(postId: ID!): Boolean!
  unsavePost(postId: ID!): Boolean!
  heartbeat: Boolean!
}
```

#### Subscriptions

```graphql
type Subscription {
  commentAdded(postId: ID!): Comment!
  postUpdated(postId: ID): Post!
  reactionToggled(targetType: ReactionTarget!, targetId: ID!): Reaction
}
```

## Models

### User
- `username` - Unique, 3-30 chars, alphanumeric + underscore
- `email` - Unique, valid email
- `password` - Hashed with bcrypt
- `bio` - Max 500 chars
- `avatar` - URL
- `role` - user/moderator/admin
- `savedPosts` - Array of Post IDs
- `lastSeen` - For online status

### Post
- `type` - text/link/image/poll
- `title` - Max 300 chars
- `content` - Max 10000 chars
- `tags` - Array of strings
- `ephemeralUntil` - Auto-delete date
- `poll` - Poll data (question, options, votes)

### Comment
- `text` - Max 5000 chars
- `depth` - Nesting level (max 10)
- `parentComment` - For nested replies

### Lens
- `name` - Max 50 chars
- `rules` - Filter rules (minReactions, author, containsText, hasTag, postType)

### Reaction
- `type` - like/dislike/love/laugh/wow/sad/angry
- `targetType` - post/comment

## Features

### Authentication
- JWT tokens
- Password hashing (bcrypt)
- Protected resolvers

### Username Bloom Filter
- Fast username availability check
- Reduces database queries
- Initializes with existing usernames on startup

### Online Status
- Heartbeat mechanism
- 5-minute online threshold
- `isOnline` computed field

### Real-time Updates
- WebSocket subscriptions
- Comment notifications
- Post updates
- Reaction changes

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed database |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Fix ESLint errors |

## Testing

Uses Jest with mongodb-memory-server for isolated tests.

```bash
npm test              # All tests with coverage
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
```

## Docker

```bash
docker build -t burrow-server .
docker run -p 4000:4000 burrow-server
```

Or use docker-compose from root:
```bash
docker-compose up api
```

## Error Handling

Custom error classes:
- `AuthenticationError` - 401 Unauthorized
- `AuthorizationError` - 403 Forbidden
- `NotFoundError` - 404 Not Found
- `ValidationError` - 400 Bad Request
- `ConflictError` - 409 Conflict
