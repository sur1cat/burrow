import mongoose from 'mongoose';
import { Reaction, Post, Comment, IReaction, ReactionType, ReactionTarget } from '../../models';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { Context, requireAuth } from '../context';
import { pubsub, REACTION_TOGGLED, POST_UPDATED } from './subscriptions';

export const reactionResolvers = {
  Query: {
    reactions: async (
      _: unknown,
      { targetType, targetId }: { targetType: ReactionTarget; targetId: string }
    ) => {
      return Reaction.find({
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
      })
        .populate('user')
        .sort({ createdAt: -1 });
    },
  },

  Mutation: {
    toggleReaction: async (
      _: unknown,
      {
        targetType,
        targetId,
        type,
      }: { targetType: ReactionTarget; targetId: string; type: ReactionType },
      context: Context
    ) => {
      const currentUser = requireAuth(context);

      const targetObjectId = new mongoose.Types.ObjectId(targetId);

      if (targetType === 'post') {
        const post = await Post.findOne({ _id: targetObjectId, isDeleted: false });
        if (!post) {
          throw new NotFoundError('Post');
        }
      } else if (targetType === 'comment') {
        const comment = await Comment.findOne({ _id: targetObjectId, isDeleted: false });
        if (!comment) {
          throw new NotFoundError('Comment');
        }
      } else {
        throw new ValidationError('Invalid target type');
      }

      const existingReaction = await Reaction.findOne({
        user: currentUser._id,
        targetType,
        targetId: targetObjectId,
      });

      let added = false;

      if (existingReaction) {
        if (existingReaction.type === type) {
          await Reaction.findByIdAndDelete(existingReaction._id);
          added = false;
        } else {
          existingReaction.type = type;
          await existingReaction.save();
          added = true;
        }
      } else {
        await Reaction.create({
          user: currentUser._id,
          targetType,
          targetId: targetObjectId,
          type,
        });
        added = true;
      }

      const reactionCount = await Reaction.countDocuments({
        targetType,
        targetId: targetObjectId,
      });

      if (targetType === 'post') {
        const updatedPost = await Post.findByIdAndUpdate(
          targetObjectId,
          { reactionsCount: reactionCount },
          { new: true }
        ).populate('author');

        pubsub.publish(POST_UPDATED, { postUpdated: updatedPost });
      } else {
        await Comment.findByIdAndUpdate(targetObjectId, {
          reactionsCount: reactionCount,
        });
      }

      const reaction = await Reaction.findOne({
        user: currentUser._id,
        targetType,
        targetId: targetObjectId,
      }).populate('user');

      pubsub.publish(`${REACTION_TOGGLED}.${targetType}.${targetId}`, {
        reactionToggled: reaction,
      });

      return added;
    },
  },

  Subscription: {
    postUpdated: {
      subscribe: (_: unknown, { postId }: { postId?: string }) => {
        if (postId) {
          return pubsub.asyncIterator(`${POST_UPDATED}.${postId}`);
        }
        return pubsub.asyncIterator(POST_UPDATED);
      },
    },

    reactionToggled: {
      subscribe: (
        _: unknown,
        { targetType, targetId }: { targetType: ReactionTarget; targetId: string }
      ) => {
        return pubsub.asyncIterator(
          `${REACTION_TOGGLED}.${targetType}.${targetId}`
        );
      },
    },
  },

  Reaction: {
    id: (parent: IReaction) => parent._id.toString(),
    targetId: (parent: IReaction) => parent.targetId.toString(),

    user: async (parent: IReaction) => {
      if (parent.user && typeof parent.user === 'object' && 'username' in parent.user) {
        return parent.user;
      }
      const { User } = await import('../../models');
      return User.findById(parent.user);
    },
  },
};
