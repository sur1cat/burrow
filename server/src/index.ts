import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { config } from './config';
import { connectDatabase } from './config/database';
import { typeDefs, resolvers, createContext } from './graphql';
import { User } from './models';
import { verifyToken, extractTokenFromHeader } from './utils/auth';
import { usernameBloomFilter } from './utils/username-bloom-filter';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = extractTokenFromHeader(
          ctx.connectionParams?.authorization as string | undefined
        );

        if (!token) {
          return { user: null, userId: null };
        }

        const payload = verifyToken(token);
        if (!payload) {
          return { user: null, userId: null };
        }

        const user = await User.findById(payload.userId);
        if (!user || user.isDeleted) {
          return { user: null, userId: null };
        }

        return {
          user,
          userId: user._id.toString(),
        };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (formattedError) => {
      console.error('GraphQL Error:', formattedError);

      if (config.nodeEnv === 'production') {
        return {
          message: formattedError.message,
          extensions: {
            code: formattedError.extensions?.code || 'INTERNAL_ERROR',
          },
        };
      }

      return formattedError;
    },
  });

  await connectDatabase();
  await usernameBloomFilter.initialize();
  await server.start();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: createContext,
    })
  );

  httpServer.listen(config.port, () => {
    console.log(`
========================================
  Burrow GraphQL Server
========================================
  Environment: ${config.nodeEnv}
  HTTP:        http://localhost:${config.port}/graphql
  WebSocket:   ws://localhost:${config.port}/graphql
  Health:      http://localhost:${config.port}/health
========================================
    `);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
