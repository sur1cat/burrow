import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from '../../graphql';
import { User, Post } from '../../models';
import { generateToken } from '../../utils/auth';

describe('GraphQL Integration Tests', () => {
  let server: ApolloServer;

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    server = new ApolloServer({ schema });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await server.executeOperation({
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                username
                email
              }
            }
          }
        `,
        variables: {
          input: {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data as {
          register: { token: string; user: { username: string; email: string } };
        };
        expect(data.register.token).toBeDefined();
        expect(data.register.user.username).toBe('newuser');
        expect(data.register.user.email).toBe('newuser@example.com');
      }
    });

    it('should login an existing user', async () => {
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
      });

      const response = await server.executeOperation({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
              user {
                username
                email
              }
            }
          }
        `,
        variables: {
          input: {
            email: 'login@example.com',
            password: 'password123',
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data as {
          login: { token: string; user: { username: string } };
        };
        expect(data.login.token).toBeDefined();
        expect(data.login.user.username).toBe('loginuser');
      }
    });

    it('should fail login with wrong password', async () => {
      await User.create({
        username: 'wrongpass',
        email: 'wrongpass@example.com',
        password: 'correctpassword',
      });

      const response = await server.executeOperation({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
            }
          }
        `,
        variables: {
          input: {
            email: 'wrongpass@example.com',
            password: 'wrongpassword',
          },
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0]?.message).toContain('Invalid');
      }
    });
  });

  describe('Posts', () => {
    it('should fetch posts', async () => {
      const user = await User.create({
        username: 'postauthor',
        email: 'author@example.com',
        password: 'password123',
      });

      await Post.create({
        type: 'text',
        title: 'Test Post',
        content: 'Test content',
        author: user._id,
      });

      const response = await server.executeOperation({
        query: `
          query GetPosts {
            posts {
              posts {
                id
                title
                content
                author {
                  username
                }
              }
              totalCount
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data as {
          posts: { posts: Array<{ title: string }>; totalCount: number };
        };
        expect(data.posts.posts.length).toBeGreaterThan(0);
        expect(data.posts.posts[0].title).toBe('Test Post');
      }
    });

    it('should create a post when authenticated', async () => {
      const user = await User.create({
        username: 'creator',
        email: 'creator@example.com',
        password: 'password123',
      });

      const token = generateToken(user);

      const response = await server.executeOperation(
        {
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                content
                type
                author {
                  username
                }
              }
            }
          `,
          variables: {
            input: {
              type: 'text',
              title: 'New Post',
              content: 'Created via test',
            },
          },
        },
        {
          contextValue: { user, userId: user._id.toString() },
        }
      );

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data as {
          createPost: { title: string; author: { username: string } };
        };
        expect(data.createPost.title).toBe('New Post');
        expect(data.createPost.author.username).toBe('creator');
      }
    });
  });

  describe('Users', () => {
    it('should fetch users list', async () => {
      await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const response = await server.executeOperation({
        query: `
          query GetUsers {
            users {
              id
              username
              email
            }
          }
        `,
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data as {
          users: Array<{ username: string }>;
        };
        expect(data.users.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
