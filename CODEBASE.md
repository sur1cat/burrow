# Burrow - Полное описание кодовой базы

Этот документ содержит подробное описание всей архитектуры и кода проекта Burrow.

---

## Содержание

1. [Общая архитектура](#общая-архитектура)
2. [Server (Backend)](#server-backend)
3. [Client (Frontend)](#client-frontend)
4. [Docker и инфраструктура](#docker-и-инфраструктура)
5. [Потоки данных](#потоки-данных)

---

## Общая архитектура

```
burrow/
├── client/                 # Frontend - Next.js приложение
├── server/                 # Backend - GraphQL API сервер
├── docker-compose.yml      # Оркестрация контейнеров
├── .env.example            # Шаблон переменных окружения
└── README.md               # Документация проекта
```

### Стек технологий

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 16, React 19, Apollo Client, Zustand, Tailwind CSS |
| Backend | Node.js, Express, Apollo Server, GraphQL, MongoDB |
| База данных | MongoDB 7 |
| Реал-тайм | WebSocket (graphql-ws) |
| Аутентификация | JWT (JSON Web Tokens) |
| Контейнеризация | Docker, Docker Compose |

---

## Server (Backend)

### Структура директорий

```
server/
├── src/
│   ├── config/             # Конфигурация приложения
│   ├── graphql/            # GraphQL схема и резолверы
│   ├── models/             # Mongoose модели (MongoDB)
│   ├── utils/              # Утилиты и хелперы
│   ├── tests/              # Тесты (Jest)
│   ├── index.ts            # Точка входа сервера
│   └── seed.ts             # Скрипт заполнения БД тестовыми данными
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

### src/index.ts - Точка входа

**Назначение:** Главный файл сервера, инициализирует все компоненты.

```typescript
// Что делает:
1. Создаёт Express приложение
2. Настраивает Apollo Server для GraphQL
3. Настраивает WebSocket сервер для подписок
4. Подключается к MongoDB
5. Инициализирует Bloom filter для username
6. Запускает HTTP сервер
```

**Ключевые компоненты:**
- `expressMiddleware` - интегрирует Apollo Server с Express
- `WebSocketServer` - сервер для real-time подписок
- `useServer` - связывает GraphQL схему с WebSocket
- `connectDatabase` - подключение к MongoDB
- `usernameBloomFilter.initialize()` - загрузка существующих username в фильтр

---

### src/config/

#### index.ts - Конфигурация окружения

```typescript
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
```

**Зачем:** Централизованное управление переменными окружения. Все настройки в одном месте.

#### database.ts - Подключение к MongoDB

```typescript
export async function connectDatabase() {
  await mongoose.connect(config.mongoUri);
}
```

**Зачем:** Изолированная логика подключения к базе данных с обработкой ошибок.

---

### src/models/ - Mongoose модели

Каждая модель описывает структуру документа в MongoDB.

#### User.ts - Модель пользователя

```typescript
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  bio: { type: String, maxlength: 500 },
  avatar: String,
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  lastSeen: Date,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
```

**Поля:**
- `username` - уникальный логин (3-30 символов)
- `email` - email для входа
- `password` - хешированный пароль (bcrypt), `select: false` - не возвращается по умолчанию
- `bio` - биография пользователя
- `avatar` - URL аватара
- `role` - роль (user/moderator/admin)
- `savedPosts` - массив сохранённых постов
- `lastSeen` - время последней активности (для онлайн-статуса)
- `isDeleted` - мягкое удаление (soft delete)

**Методы:**
- `comparePassword(password)` - сравнивает пароль с хешем
- Pre-save hook - хеширует пароль перед сохранением

#### Post.ts - Модель поста

```typescript
const postSchema = new Schema({
  type: { type: String, enum: ['text', 'link', 'image', 'poll'], required: true },
  title: { type: String, required: true, maxlength: 300 },
  content: { type: String, required: true, maxlength: 10000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  linkUrl: String,
  imageUrl: String,
  poll: {
    question: String,
    options: [{
      id: String,
      text: String,
      votes: { type: Number, default: 0 },
      voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }],
    endsAt: Date
  },
  tags: [String],
  ephemeralUntil: Date,
  reactionsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
```

**Типы постов:**
- `text` - текстовый пост
- `link` - пост со ссылкой
- `image` - пост с изображением
- `poll` - опрос

**Особенности:**
- `ephemeralUntil` - дата автоудаления (эфемерные посты)
- `reactionsCount/commentsCount` - кешированные счётчики для производительности
- `poll.voters` - отслеживание кто голосовал (защита от повторного голосования)

#### Comment.ts - Модель комментария

```typescript
const commentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 5000 },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  depth: { type: Number, default: 0, max: 10 },
  reactionsCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
```

**Вложенность:**
- `parentComment` - ссылка на родительский комментарий
- `depth` - уровень вложенности (макс. 10)

#### Lens.ts - Модель линзы (фильтра)

```typescript
const lensSchema = new Schema({
  name: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 200 },
  rules: [{
    type: { type: String, enum: ['minReactions', 'author', 'containsText', 'hasTag', 'postType'] },
    value: String
  }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });
```

**Типы правил:**
- `minReactions` - минимум реакций
- `author` - посты от конкретного автора
- `containsText` - содержит текст
- `hasTag` - имеет тег
- `postType` - тип поста (text/link/image/poll)

#### Reaction.ts - Модель реакции

```typescript
const reactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['post', 'comment'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['like', 'dislike', 'love', 'laugh', 'wow', 'sad', 'angry'] },
}, { timestamps: true });

// Уникальный индекс: один пользователь - одна реакция на объект
reactionSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
```

---

### src/graphql/ - GraphQL слой

#### schema/typeDefs.ts - Схема GraphQL

**Зачем:** Определяет типы данных, запросы, мутации и подписки.

```graphql
# Типы данных
type User { ... }
type Post { ... }
type Comment { ... }
type Lens { ... }
type Reaction { ... }

# Входные типы для мутаций
input RegisterInput { ... }
input CreatePostInput { ... }

# Запросы (чтение данных)
type Query {
  me: User                           # Текущий пользователь
  posts(...): PaginatedPosts!        # Список постов
  checkUsernameAvailable(...): ...   # Проверка username
}

# Мутации (изменение данных)
type Mutation {
  register(...): AuthPayload!        # Регистрация
  login(...): AuthPayload!           # Вход
  createPost(...): Post!             # Создание поста
  toggleReaction(...): Boolean!      # Реакция
  heartbeat: Boolean!                # Обновление онлайн-статуса
}

# Подписки (реал-тайм)
type Subscription {
  commentAdded(postId: ID!): Comment!
  postUpdated(postId: ID): Post!
}
```

#### resolvers/ - Резолверы

Резолверы - функции, которые выполняют логику для каждого поля в схеме.

##### auth.resolver.ts - Аутентификация

```typescript
register: async (_, { input }) => {
  // 1. Валидация входных данных (Zod)
  // 2. Проверка существования email/username
  // 3. Создание пользователя (пароль хешируется автоматически)
  // 4. Добавление username в Bloom filter
  // 5. Генерация JWT токена
  // 6. Возврат { token, user }
}

login: async (_, { input }) => {
  // 1. Поиск пользователя по email
  // 2. Проверка пароля
  // 3. Обновление lastLoginAt
  // 4. Генерация JWT токена
  // 5. Возврат { token, user }
}

checkUsernameAvailable: async (_, { username }) => {
  // 1. Валидация формата username
  // 2. Проверка через Bloom filter (быстро)
  // 3. Если Bloom filter говорит "может существовать" - проверка в БД
  // 4. Возврат { available, reason }
}
```

##### post.resolver.ts - Работа с постами

```typescript
posts: async (_, { limit, offset, filter }) => {
  // Построение запроса с фильтрами
  // Пагинация
  // Подсчёт общего количества
}

createPost: async (_, { input }, context) => {
  // Проверка авторизации
  // Валидация данных
  // Создание поста
  // Публикация события для подписок
}

votePoll: async (_, { postId, optionId }, context) => {
  // Проверка что пользователь ещё не голосовал
  // Увеличение счётчика голосов
  // Добавление пользователя в voters
}
```

##### user.resolver.ts - Работа с пользователями

```typescript
// Вычисляемые поля (Field Resolvers)
User: {
  isOnline: (parent) => {
    // Проверка lastSeen < 5 минут назад
    if (!parent.lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(parent.lastSeen) > fiveMinutesAgo;
  },

  postsCount: async (parent) => {
    return Post.countDocuments({ author: parent._id, isDeleted: false });
  },

  savedPosts: async (parent) => {
    return Post.find({ _id: { $in: parent.savedPosts } });
  }
}

// Мутации
savePost: async (_, { postId }, context) => {
  await User.findByIdAndUpdate(context.user._id, {
    $addToSet: { savedPosts: postId }
  });
}

heartbeat: async (_, __, context) => {
  await User.findByIdAndUpdate(context.user._id, {
    lastSeen: new Date()
  });
}
```

##### comment.resolver.ts - Комментарии

```typescript
addComment: async (_, { postId, text, parentCommentId }, context) => {
  // 1. Определение depth (глубины вложенности)
  // 2. Создание комментария
  // 3. Увеличение commentsCount у поста
  // 4. Публикация события COMMENT_ADDED для подписок
}

// Подписка на новые комментарии
Subscription: {
  commentAdded: {
    subscribe: (_, { postId }) => {
      return pubsub.asyncIterator([`COMMENT_ADDED_${postId}`]);
    }
  }
}
```

#### context.ts - Контекст GraphQL

```typescript
export async function createContext({ req }): Promise<Context> {
  // 1. Извлечение токена из заголовка Authorization
  // 2. Верификация JWT токена
  // 3. Загрузка пользователя из БД
  // 4. Возврат { user, userId }
}
```

**Зачем:** Контекст доступен во всех резолверах. Содержит информацию о текущем пользователе.

---

### src/utils/ - Утилиты

#### auth.ts - JWT утилиты

```typescript
export function generateToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  return jwt.verify(token, config.jwtSecret);
}

export function extractTokenFromHeader(header?: string): string | null {
  // "Bearer <token>" -> "<token>"
}
```

#### errors.ts - Кастомные ошибки

```typescript
export class AuthenticationError extends GraphQLError {
  constructor(message = 'Not authenticated') {
    super(message, { extensions: { code: 'UNAUTHENTICATED' } });
  }
}

export class AuthorizationError extends GraphQLError { ... }
export class NotFoundError extends GraphQLError { ... }
export class ValidationError extends GraphQLError { ... }
export class ConflictError extends GraphQLError { ... }
```

**Зачем:** GraphQL-совместимые ошибки с кодами для обработки на клиенте.

#### validators.ts - Валидация (Zod)

```typescript
export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createPostSchema = z.object({
  type: z.enum(['text', 'link', 'image', 'poll']),
  title: z.string().min(1).max(300),
  content: z.string().max(10000),
  // ...
});

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }
  return result.data;
}
```

#### username-bloom-filter.ts - Bloom Filter

```typescript
class UsernameBloomFilter {
  private bits: Uint8Array;  // Битовый массив

  // 3 хеш-функции для распределения
  private hash1(str: string): number { ... }
  private hash2(str: string): number { ... }
  private hash3(str: string): number { ... }

  add(username: string): void {
    // Установка битов по индексам от хеш-функций
  }

  mightExist(username: string): boolean {
    // Проверка всех битов
    // true = возможно существует (нужна проверка в БД)
    // false = точно не существует
  }

  async initialize(): Promise<void> {
    // Загрузка всех существующих username из БД
  }
}
```

**Зачем:** Быстрая проверка существования username без запроса к БД. Экономит ресурсы при регистрации.

---

### src/seed.ts - Заполнение тестовыми данными

```typescript
async function seed() {
  // 1. Очистка всех коллекций
  // 2. Создание тестовых пользователей
  // 3. Создание тестовых постов (разных типов)
  // 4. Создание комментариев
  // 5. Создание линз
  // 6. Создание реакций
}
```

**Тестовые аккаунты:**
- `test@example.com` / `test123` - обычный пользователь
- `alice@example.com` / `password123` - администратор

---

## Client (Frontend)

### Структура директорий

```
client/
├── app/                    # Next.js App Router (страницы)
├── components/             # React компоненты
├── graphql/                # GraphQL запросы и мутации
├── hooks/                  # Кастомные React хуки
├── lib/                    # Утилиты
├── providers/              # Context провайдеры
├── store/                  # Zustand сторы (состояние)
└── public/                 # Статические файлы
```

---

### app/ - Страницы (App Router)

Next.js App Router использует файловую систему для роутинга.

```
app/
├── (auth)/                 # Группа авторизации (без layout навбара)
│   ├── login/
│   │   └── page.tsx        # /login
│   └── register/
│       └── page.tsx        # /register
│
├── (main)/                 # Основные страницы (с навбаром)
│   ├── feed/
│   │   └── page.tsx        # /feed - лента постов
│   ├── saved/
│   │   └── page.tsx        # /saved - сохранённые посты
│   ├── profile/
│   │   └── page.tsx        # /profile - редактирование профиля
│   └── thread/
│       └── [id]/
│           └── page.tsx    # /thread/:id - страница поста
│
├── user/
│   └── [username]/
│       └── page.tsx        # /user/:username - профиль пользователя
│
├── globals.css             # Глобальные стили
├── layout.tsx              # Корневой layout
└── page.tsx                # / - редирект на /feed
```

#### layout.tsx - Корневой Layout

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApolloProvider>           {/* GraphQL клиент */}
          <HeartbeatProvider>      {/* Онлайн-статус */}
            {children}
          </HeartbeatProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
```

#### (auth)/register/page.tsx - Страница регистрации

```tsx
export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ checking, available, reason });

  // Дебаунсированная проверка username через GraphQL
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await checkUsername({ variables: { username } });
      setUsernameStatus(data.checkUsernameAvailable);
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  // Форма с визуальной индикацией доступности username
}
```

#### (main)/feed/page.tsx - Лента постов

```tsx
export default function FeedPage() {
  const { data, loading, fetchMore } = useQuery(GET_POSTS, {
    variables: { limit: 20, offset: 0, filter }
  });

  return (
    <div className="main-content">
      <div className="feed-container">
        <CreatePostForm />           {/* Форма создания поста */}
        <LensSelector />             {/* Выбор фильтра */}
        {data.posts.posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Sidebar />                    {/* Боковая панель */}
    </div>
  );
}
```

#### (main)/thread/[id]/page.tsx - Страница поста

```tsx
export default function ThreadPage({ params }) {
  const { data } = useQuery(GET_POST, { variables: { id: params.id } });

  // Подписка на новые комментарии
  useSubscription(COMMENT_ADDED, {
    variables: { postId: params.id },
    onData: ({ data }) => {
      // Добавление нового комментария в кеш
    }
  });

  return (
    <>
      <PostCard post={data.post} expanded />
      <CommentForm postId={params.id} />
      <CommentList comments={data.post.comments} />
    </>
  );
}
```

---

### components/ - React компоненты

#### PostCard.tsx - Карточка поста

```tsx
export default function PostCard({ post, expanded = false }) {
  const [hasUpvoted, setHasUpvoted] = useState(post.userReactionType === 'like');
  const [hasDownvoted, setHasDownvoted] = useState(post.userReactionType === 'dislike');
  const [isSaved, setIsSaved] = useState(false);
  const [isSeen, setIsSeen] = useState(false);

  // Отметка как прочитанное (Bloom filter)
  useEffect(() => {
    const bloomFilter = getSeenPostsFilter();
    if (bloomFilter.mightContain(post.id)) {
      setIsSeen(true);
    }
  }, [post.id]);

  const markAsSeen = () => {
    const bloomFilter = getSeenPostsFilter();
    bloomFilter.add(post.id);
    setIsSeen(true);
  };

  return (
    <article className={`post-card ${isSeen ? 'post-seen' : ''}`}>
      {/* Голосование */}
      <div className="vote-sidebar">
        <button onClick={handleUpvote}>▲</button>
        <span>{post.reactionsCount}</span>
        <button onClick={handleDownvote}>▼</button>
      </div>

      {/* Контент */}
      <div className="post-content">
        <PostMeta author={post.author} createdAt={post.createdAt} />
        <h2><Link href={`/thread/${post.id}`}>{post.title}</Link></h2>

        {post.type === 'image' && <img src={post.imageUrl} />}
        {post.type === 'link' && <a href={post.linkUrl}>...</a>}
        {post.type === 'poll' && <PollDisplay poll={post.poll} />}

        <PostActions
          onComment={...}
          onSave={handleSave}
          onShare={...}
        />
      </div>
    </article>
  );
}
```

#### CreatePostForm.tsx - Форма создания поста

```tsx
export default function CreatePostForm() {
  const [type, setType] = useState<'text' | 'link' | 'image' | 'poll'>('text');
  const [createPost, { loading }] = useMutation(CREATE_POST, {
    refetchQueries: ['GetPosts']  // Обновление списка после создания
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Табы выбора типа поста */}
      <div className="create-form-tabs">
        <button onClick={() => setType('text')}>📝 Post</button>
        <button onClick={() => setType('image')}>🖼️ Image</button>
        <button onClick={() => setType('link')}>🔗 Link</button>
        <button onClick={() => setType('poll')}>📊 Poll</button>
      </div>

      {/* Поля в зависимости от типа */}
      <input placeholder="Title" />
      <textarea placeholder="Content" />

      {type === 'link' && <input type="url" placeholder="URL" />}
      {type === 'image' && <ImageUpload />}
      {type === 'poll' && <PollEditor />}

      {/* Эфемерный пост */}
      <label>
        <input type="checkbox" /> Ephemeral
        <select><option>24h</option><option>7d</option></select>
      </label>

      <button type="submit">Post</button>
    </form>
  );
}
```

#### CommentList.tsx - Список комментариев

```tsx
export default function CommentList({ comments, postId }) {
  // Рекурсивный рендеринг вложенных комментариев
  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} style={{ marginLeft: depth * 24 }}>
      <CommentItem comment={comment} postId={postId} />
      {comment.replies?.map(reply => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="comment-list">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
}
```

#### OnlineIndicator.tsx - Индикатор онлайн-статуса

```tsx
export default function OnlineIndicator({ isOnline, lastSeen }) {
  const getStatus = () => {
    if (isOnline) return { text: 'Online', className: 'online' };
    if (lastSeen) {
      const ago = formatTimeAgo(lastSeen);
      return { text: `Last seen ${ago}`, className: 'offline' };
    }
    return { text: 'Offline', className: 'offline' };
  };

  const status = getStatus();

  return (
    <div className="online-indicator">
      <span className={`online-dot ${status.className}`} />
      <span>{status.text}</span>
    </div>
  );
}
```

#### HeartbeatProvider.tsx - Провайдер онлайн-статуса

```tsx
export default function HeartbeatProvider({ children }) {
  useHeartbeat();  // Хук отправки heartbeat
  return <>{children}</>;
}
```

#### Navbar.tsx - Навигационная панель

```tsx
export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="navbar">
      <Link href="/feed" className="navbar-brand">
        <Logo /> Burrow
      </Link>

      <div className="navbar-nav">
        <ThemeToggle />

        {user ? (
          <>
            <Link href="/saved">Saved</Link>
            <Link href="/profile">{user.username}</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

---

### graphql/ - GraphQL операции

#### queries/posts.ts

```typescript
export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int, $filter: PostFilterInput) {
    posts(limit: $limit, offset: $offset, filter: $filter) {
      posts {
        id
        type
        title
        content
        author { id username }
        reactionsCount
        commentsCount
        hasReacted
        userReactionType
        # ...
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      # Полные данные поста с комментариями
    }
  }
`;
```

#### mutations/posts.ts

```typescript
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      # ...
    }
  }
`;

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($targetType: ReactionTarget!, $targetId: ID!, $type: ReactionType!) {
    toggleReaction(targetType: $targetType, targetId: $targetId, type: $type)
  }
`;

export const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId)
  }
`;

export const HEARTBEAT = gql`
  mutation Heartbeat {
    heartbeat
  }
`;
```

#### subscriptions/comments.ts

```typescript
export const COMMENT_ADDED = gql`
  subscription CommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      text
      author { id username }
      createdAt
    }
  }
`;
```

---

### hooks/ - Кастомные хуки

#### useHeartbeat.ts - Хук онлайн-статуса

```typescript
export function useHeartbeat() {
  const { token } = useAuthStore();
  const [sendHeartbeat] = useMutation(HEARTBEAT);

  useEffect(() => {
    if (!token) return;

    // Отправка сразу при загрузке
    sendHeartbeat();

    // Отправка каждые 2 минуты
    const interval = setInterval(() => {
      sendHeartbeat();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);
}
```

**Зачем:** Периодически обновляет `lastSeen` на сервере для отображения онлайн-статуса.

#### useAuth.ts - Хук авторизации

```typescript
export function useAuth() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  async function login(data) {
    const res = await loginMutation({ variables: data });
    setToken(res.data.login.token);
    setUser(res.data.login.user);
    router.push('/feed');
  }

  async function register(data) {
    const res = await registerMutation({ variables: data });
    setToken(res.data.register.token);
    setUser(res.data.register.user);
    router.push('/feed');
  }

  return { login, register };
}
```

---

### lib/ - Утилиты

#### apollo-client.ts - Настройка Apollo Client

```typescript
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP,
});

const wsLink = new GraphQLWsLink(createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_WS,
  connectionParams: () => ({
    authorization: localStorage.getItem('token'),
  }),
}));

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem('token')
      ? `Bearer ${localStorage.getItem('token')}`
      : '',
  },
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription';
  },
  wsLink,      // Подписки через WebSocket
  authLink.concat(httpLink),  // Запросы через HTTP
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

**Зачем:** Настройка клиента для работы с GraphQL API:
- HTTP для queries/mutations
- WebSocket для subscriptions
- Автоматическое добавление токена в заголовки

#### bloom-filter.ts - Bloom Filter (клиентский)

```typescript
export class BloomFilter {
  private bits: Uint8Array;
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  add(item: string): void {
    // Установка битов
    // Сохранение в localStorage
  }

  mightContain(item: string): boolean {
    // Проверка битов
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) this.bits = new Uint8Array(JSON.parse(saved));
  }
}

export function getSeenPostsFilter(): BloomFilter {
  return new BloomFilter('burrow_seen_posts');
}
```

**Зачем:** Отслеживание просмотренных постов на клиенте. Данные сохраняются в localStorage.

---

### store/ - Zustand сторы

#### auth.store.ts - Состояние авторизации

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      setSession: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage' }  // Ключ в localStorage
  )
);
```

**Зачем:** Глобальное состояние авторизации с персистентностью в localStorage.

#### theme.store.ts - Состояние темы

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'theme-storage' }
  )
);
```

---

### globals.css - Глобальные стили

```css
/* CSS переменные для темизации */
:root, [data-theme="light"] {
  --bg-canvas: #f5f0eb;
  --bg-card: #ffffff;
  --text-primary: #2d2a26;
  --accent-primary: #c4956a;
  /* ... */
}

[data-theme="dark"] {
  --bg-canvas: #1a1816;
  --bg-card: #252220;
  --text-primary: #f0ebe5;
  /* ... */
}

/* Компоненты используют переменные */
.post-card {
  background-color: var(--bg-card);
  color: var(--text-primary);
}
```

---

## Docker и инфраструктура

### docker-compose.yml

```yaml
services:
  mongo:           # MongoDB база данных
  mongo-express:   # Веб-интерфейс для MongoDB
  api:             # GraphQL сервер
  client:          # Next.js клиент

volumes:
  mongo_data:      # Персистентное хранилище MongoDB

networks:
  burrow-network:  # Внутренняя сеть для сервисов
```

**Порты:**
- `3000` - Client (Next.js)
- `4000` - API (GraphQL)
- `8081` - Mongo Express
- `27017` - MongoDB

---

## Потоки данных

### Регистрация пользователя

```
1. Пользователь вводит данные в форму (RegisterPage)
2. При вводе username - дебаунсированный запрос checkUsernameAvailable
3. Сервер проверяет Bloom filter → если нужно, проверяет БД
4. При отправке формы - mutation register
5. Сервер валидирует данные (Zod)
6. Создаёт пользователя в MongoDB (пароль хешируется)
7. Добавляет username в Bloom filter
8. Генерирует JWT токен
9. Клиент сохраняет токен в localStorage через Zustand
10. Редирект на /feed
```

### Создание поста

```
1. Пользователь заполняет CreatePostForm
2. mutation createPost с input данными
3. Сервер проверяет авторизацию (context.user)
4. Валидирует данные (Zod)
5. Создаёт документ в MongoDB
6. Публикует событие POST_UPDATED (pubsub)
7. Клиент получает ответ, обновляет кеш (refetchQueries)
8. Новый пост появляется в ленте
```

### Real-time комментарии

```
1. Пользователь A открывает /thread/:id
2. Клиент устанавливает WebSocket соединение
3. Подписка на COMMENT_ADDED для этого postId
4. Пользователь B добавляет комментарий
5. Сервер создаёт комментарий в БД
6. Сервер публикует событие COMMENT_ADDED_${postId}
7. WebSocket доставляет событие клиенту A
8. Клиент A обновляет UI без перезагрузки
```

### Онлайн-статус

```
1. Пользователь авторизован
2. HeartbeatProvider вызывает useHeartbeat
3. Хук отправляет mutation heartbeat каждые 2 минуты
4. Сервер обновляет lastSeen в User документе
5. При запросе профиля другого пользователя
6. Field resolver isOnline вычисляет: lastSeen > (now - 5 min)
7. OnlineIndicator отображает статус
```

---

## Безопасность

### Аутентификация
- Пароли хешируются bcrypt (salt rounds: 10)
- JWT токены с ограниченным сроком действия
- Токен передаётся в заголовке Authorization

### Авторизация
- `requireAuth(context)` - проверка наличия пользователя
- `requireOwnership(resource, context)` - проверка владельца
- Role-based access для модераторов/админов

### Валидация
- Zod схемы на сервере
- Санитизация входных данных
- Ограничения длины полей

### Защита данных
- Пароль не возвращается в запросах (`select: false`)
- Soft delete вместо удаления
- CORS настроен на конкретный origin
