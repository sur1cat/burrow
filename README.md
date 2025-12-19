# Burrow

A Reddit-like social platform built with the MERN stack, GraphQL, and real-time capabilities.

## Project Description

Burrow is a modern social platform that allows users to:
- Create and share posts (text, links, images, polls)
- Comment on posts with nested replies
- React to posts and comments
- Create custom "Lenses" to filter content
- Participate in ephemeral (temporary) discussions
- Experience real-time updates through GraphQL subscriptions

### User Roles
- **User**: Can create posts, comments, reactions, and personal lenses
- **Moderator**: Can moderate content and delete inappropriate posts/comments
- **Admin**: Full access to all features and user management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** (strict mode)
- **GraphQL** with Apollo Server
- **MongoDB** with Mongoose
- **JWT** for authentication
- **graphql-ws** for WebSocket subscriptions
- **Jest** for testing
- **Zod** for input validation

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Apollo Client** for GraphQL
- **Zustand** for state management
- **TailwindCSS** for styling
- **react-hook-form** with Zod validation

### DevOps
- **Docker** & **Docker Compose**
- Separate Dockerfiles for client and server
- Health checks for all services

## Data Schema

### Models

#### User
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username (3-30 chars) |
| email | String | Unique email address |
| password | String | Hashed password |
| bio | String | User biography (max 500 chars) |
| avatar | String | Avatar URL |
| role | Enum | user/moderator/admin |
| isDeleted | Boolean | Soft delete flag |

#### Post
| Field | Type | Description |
|-------|------|-------------|
| type | Enum | text/link/image/poll |
| title | String | Post title (max 300 chars) |
| content | String | Post content (max 10000 chars) |
| author | ObjectId | Reference to User |
| linkUrl | String | URL for link posts |
| imageUrl | String | URL for image posts |
| poll | Object | Poll data for poll posts |
| tags | [String] | Array of tags |
| ephemeralUntil | Date | Expiry date for ephemeral posts |
| reactionsCount | Number | Cached reaction count |
| commentsCount | Number | Cached comment count |

#### Comment
| Field | Type | Description |
|-------|------|-------------|
| post | ObjectId | Reference to Post |
| author | ObjectId | Reference to User |
| text | String | Comment text (max 5000 chars) |
| parentComment | ObjectId | Reference to parent Comment |
| depth | Number | Nesting level (max 10) |
| reactionsCount | Number | Cached reaction count |

#### Lens
| Field | Type | Description |
|-------|------|-------------|
| name | String | Lens name (max 50 chars) |
| description | String | Description (max 200 chars) |
| rules | [Object] | Filter rules |
| author | ObjectId | Reference to User |
| isPublic | Boolean | Public visibility |
| pinned | Boolean | Pinned status |
| usageCount | Number | Usage statistics |

#### Reaction
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Reference to User |
| targetType | Enum | post/comment |
| targetId | ObjectId | Reference to target |
| type | Enum | like/love/laugh/wow/sad/angry |

### Relationships
- User → Posts (one-to-many)
- User → Comments (one-to-many)
- Post → Comments (one-to-many)
- User → Lenses (one-to-many)
- User → Reactions (one-to-many)

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Git

### Running the Application

1. Clone the repository and navigate to the project:
```bash
cd burrow
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your settings (especially JWT_SECRET)
```

3. Start all services:
```bash
docker-compose up
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql
- **Mongo Express** (optional): http://localhost:8081

### Seeding the Database

To populate the database with sample data:
```bash
# With Docker
docker-compose exec api npm run seed

# Or locally (requires MongoDB running)
cd server
npm run seed
```

## Local Development

### Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Available Scripts

### Server
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run lint` | Run ESLint |

### Client
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## GraphQL API

### Queries (8 total)
- `me` - Get current authenticated user
- `user(id)` - Get user by ID
- `users` - List all users
- `posts` - List posts with filters and pagination
- `post(id)` - Get post by ID
- `postsByUser(userId)` - Get posts by user
- `comments(postId)` - Get comments for a post
- `lenses` - Get available lenses

### Mutations (12 total)
- `register` - Register new user
- `login` - Authenticate user
- `updateProfile` - Update user profile
- `deleteAccount` - Delete user account
- `createPost` - Create new post
- `updatePost` - Update existing post
- `deletePost` - Delete post
- `votePoll` - Vote on poll option
- `addComment` - Add comment to post
- `updateComment` - Update comment
- `deleteComment` - Delete comment
- `toggleReaction` - Toggle reaction on post/comment
- `createLens` - Create custom lens
- `updateLens` - Update lens
- `deleteLens` - Delete lens

### Subscriptions (3 total)
- `commentAdded(postId)` - Real-time comment updates
- `postUpdated` - Real-time post updates
- `reactionToggled` - Real-time reaction updates

## Testing Real-time Features

### Comment Subscription Test

1. Open two browser windows/tabs
2. Navigate to the same post detail page in both
3. Add a comment in one window
4. Observe the comment appearing instantly in the other window

### Step-by-step:
```
1. Open http://localhost:3000/thread/[post-id] in Browser A
2. Open http://localhost:3000/thread/[post-id] in Browser B
3. Login in Browser A
4. Add a comment in Browser A
5. Observe the comment appearing in Browser B without refresh
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | alice@example.com | password123 |
| Moderator | bob@example.com | password123 |
| User | test@example.com | test123 |

## Demo URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| GraphQL Endpoint | http://localhost:4000/graphql |
| WebSocket Endpoint | ws://localhost:4000/graphql |
| Health Check | http://localhost:4000/health |

## Project Structure

```
burrow/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── graphql/           # GraphQL queries/mutations
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── providers/         # Context providers
│   ├── store/             # Zustand stores
│   └── Dockerfile
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── graphql/       # GraphQL schema & resolvers
│   │   ├── models/        # Mongoose models
│   │   ├── tests/         # Jest tests
│   │   ├── utils/         # Utilities
│   │   ├── index.ts       # Entry point
│   │   └── seed.ts        # Database seeder
│   └── Dockerfile
│
├── docker-compose.yml     # Docker Compose configuration
├── .env.example           # Environment variables template
└── README.md
```

## Team & Contributions

| Team Member | Contributions |
|-------------|---------------|
| [Student 1] | Backend API, GraphQL schema, authentication |
| [Student 2] | Frontend, UI/UX, state management |

## License

This project is created for educational purposes as part of the MERN course final project.
