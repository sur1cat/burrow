# Burrow Client

Next.js frontend for Burrow - a Reddit-like social platform.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Apollo Client** - GraphQL client
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Zod** - Validation
- **React Hook Form** - Form handling

## Getting Started

### Prerequisites

- Node.js >= 18
- Running GraphQL server (see `/server`)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS=ws://localhost:4000/graphql
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (main)/            # Main app pages
│   │   ├── feed/          # Posts feed
│   │   ├── saved/         # Saved posts
│   │   ├── profile/       # User profile (edit)
│   │   └── thread/[id]/   # Post detail
│   ├── user/[username]/   # Public user profile
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   ├── CreatePostForm.tsx
│   ├── HeartbeatProvider.tsx
│   ├── ImageUpload.tsx
│   ├── Navbar.tsx
│   ├── OnlineIndicator.tsx
│   ├── PostCard.tsx
│   ├── ProtectedRoute.tsx
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   └── poll/
│       ├── PollDisplay.tsx
│       └── PollEditor.tsx
│
├── graphql/               # GraphQL operations
│   ├── mutations/
│   │   ├── auth.ts
│   │   ├── comments.ts
│   │   └── posts.ts
│   ├── queries/
│   │   ├── posts.ts
│   │   └── users.ts
│   └── subscriptions/
│       └── comments.ts
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   └── useHeartbeat.ts
│
├── lib/                   # Utilities
│   ├── apollo-client.ts   # Apollo Client setup
│   ├── bloom-filter.ts    # Seen posts tracking
│   ├── lens-utils.ts      # Lens filtering
│   └── validators.ts      # Zod schemas
│
├── providers/             # Context providers
│   └── ApolloProvider.tsx
│
├── store/                 # Zustand stores
│   ├── auth.store.ts      # Auth state
│   └── theme.store.ts     # Theme state
│
└── public/                # Static assets
    └── icons/
```

## Features

### Authentication
- JWT-based authentication
- Persistent sessions (localStorage)
- Protected routes

### Posts
- Create posts (text, link, image, poll)
- Edit/delete own posts
- Ephemeral posts (auto-delete)
- Save/unsave posts
- Seen posts tracking (Bloom filter)

### Comments
- Nested comments (up to 10 levels)
- Real-time updates (WebSocket)
- Edit/delete own comments

### Reactions
- Like/dislike posts and comments
- Multiple reaction types

### User Features
- Profile editing
- Avatar upload
- Bio
- Password change
- Online status indicator

### Lenses
- Custom feed filters
- Filter by post type, tags, reactions
- Public/private lenses

### Theme
- Dark/Light mode
- System preference detection
- Persistent theme choice

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Styling

Uses Tailwind CSS with custom CSS variables for theming.

Theme variables are defined in `app/globals.css`:
- `--bg-canvas`, `--bg-card` - Background colors
- `--text-primary`, `--text-secondary` - Text colors
- `--accent-primary` - Brand color
- `--success`, `--error`, `--warning` - Semantic colors

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}
```

### Theme Store (Zustand)
```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}
```

## GraphQL

Apollo Client configured with:
- HTTP link for queries/mutations
- WebSocket link for subscriptions
- Auth header injection
- Error handling

## Docker

```bash
docker build -t burrow-client .
docker run -p 3000:3000 burrow-client
```

Or use docker-compose from root:
```bash
docker-compose up client
```
