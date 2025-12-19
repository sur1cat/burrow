import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const COMMENT_ADDED = 'COMMENT_ADDED';
export const POST_UPDATED = 'POST_UPDATED';
export const REACTION_TOGGLED = 'REACTION_TOGGLED';
