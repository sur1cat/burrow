import { authResolvers } from './auth.resolver';
import { userResolvers } from './user.resolver';
import { postResolvers } from './post.resolver';
import { commentResolvers } from './comment.resolver';
import { lensResolvers } from './lens.resolver';
import { reactionResolvers } from './reaction.resolver';
import { scalarResolvers } from './scalars';

export const resolvers = {
  ...scalarResolvers,

  Query: {
    ...authResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...lensResolvers.Query,
    ...reactionResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...lensResolvers.Mutation,
    ...reactionResolvers.Mutation,
  },

  Subscription: {
    ...commentResolvers.Subscription,
    ...reactionResolvers.Subscription,
  },

  User: userResolvers.User,
  Post: postResolvers.Post,
  Comment: commentResolvers.Comment,
  Lens: lensResolvers.Lens,
  Reaction: reactionResolvers.Reaction,
};

export { pubsub, COMMENT_ADDED, POST_UPDATED, REACTION_TOGGLED } from './subscriptions';
