import mongoose from 'mongoose';
import { Comment, Post, Reaction, IComment } from '../../models';
import { ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors';
import { validate, commentSchema } from '../../utils/validators';
import { Context, requireAuth } from '../context';
import { pubsub, COMMENT_ADDED } from './subscriptions';

export const commentResolvers = {
  Query: {
    comments: async (_: unknown, { postId }: { postId: string }) => {
      const post = await Post.findOne({ _id: postId, isDeleted: false });
      if (!post) {
        throw new NotFoundError('Post');
      }

      return Comment.find({ post: postId, isDeleted: false })
        .populate('author')
        .sort({ createdAt: 1 });
    },

    comment: async (_: unknown, { id }: { id: string }) => {
      const comment = await Comment.findOne({ _id: id, isDeleted: false })
        .populate('author')
        .populate('post');
      if (!comment) {
        throw new NotFoundError('Comment');
      }
      return comment;
    },
  },

  Mutation: {
    addComment: async (
      _: unknown,
      {
        postId,
        text,
        parentCommentId,
      }: { postId: string; text: string; parentCommentId?: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(commentSchema, { text });

      const post = await Post.findOne({ _id: postId, isDeleted: false });
      if (!post) {
        throw new NotFoundError('Post');
      }

      let depth = 0;
      if (parentCommentId) {
        const parentComment = await Comment.findOne({
          _id: parentCommentId,
          post: postId,
          isDeleted: false,
        });
        if (!parentComment) {
          throw new NotFoundError('Parent comment');
        }
        depth = parentComment.depth + 1;
        if (depth > 10) {
          throw new ValidationError('Maximum nesting depth reached');
        }
      }

      const comment = await Comment.create({
        post: new mongoose.Types.ObjectId(postId),
        author: currentUser._id,
        text: validatedInput.text,
        parentComment: parentCommentId
          ? new mongoose.Types.ObjectId(parentCommentId)
          : null,
        depth,
      });

      await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: 1 },
      });

      const populatedComment = await Comment.findById(comment._id)
        .populate('author')
        .populate('post');

      pubsub.publish(`${COMMENT_ADDED}.${postId}`, {
        commentAdded: populatedComment,
      });

      return populatedComment;
    },

    updateComment: async (
      _: unknown,
      { id, text }: { id: string; text: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(commentSchema, { text });

      const comment = await Comment.findOne({ _id: id, isDeleted: false });
      if (!comment) {
        throw new NotFoundError('Comment');
      }

      if (comment.author.toString() !== currentUser._id.toString()) {
        throw new ForbiddenError('You can only edit your own comments');
      }

      const updatedComment = await Comment.findByIdAndUpdate(
        id,
        { text: validatedInput.text },
        { new: true, runValidators: true }
      )
        .populate('author')
        .populate('post');

      return updatedComment;
    },

    deleteComment: async (_: unknown, { id }: { id: string }, context: Context) => {
      const currentUser = requireAuth(context);

      const comment = await Comment.findOne({ _id: id, isDeleted: false });
      if (!comment) {
        throw new NotFoundError('Comment');
      }

      if (
        comment.author.toString() !== currentUser._id.toString() &&
        currentUser.role !== 'admin' &&
        currentUser.role !== 'moderator'
      ) {
        throw new ForbiddenError('You can only delete your own comments');
      }

      await Comment.findByIdAndUpdate(id, { isDeleted: true });
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -1 },
      });

      return {
        success: true,
        message: 'Comment deleted successfully',
      };
    },
  },

  Subscription: {
    commentAdded: {
      subscribe: (_: unknown, { postId }: { postId: string }) => {
        return pubsub.asyncIterableIterator(`${COMMENT_ADDED}.${postId}`);
      },
    },
  },

  Comment: {
    id: (parent: IComment) => parent._id.toString(),

    author: async (parent: IComment) => {
      if (parent.author && typeof parent.author === 'object' && 'username' in parent.author) {
        return parent.author;
      }
      const { User } = await import('../../models');
      return User.findById(parent.author);
    },

    post: async (parent: IComment) => {
      if (parent.post && typeof parent.post === 'object' && 'title' in parent.post) {
        return parent.post;
      }
      return Post.findById(parent.post).populate('author');
    },

    parentComment: async (parent: IComment) => {
      if (!parent.parentComment) return null;
      return Comment.findById(parent.parentComment).populate('author');
    },

    replies: async (parent: IComment) => {
      return Comment.find({ parentComment: parent._id, isDeleted: false })
        .populate('author')
        .sort({ createdAt: 1 });
    },

    hasReacted: async (parent: IComment, _: unknown, context: Context) => {
      if (!context.user) return false;
      const reaction = await Reaction.findOne({
        user: context.user._id,
        targetType: 'comment',
        targetId: parent._id,
      });
      return !!reaction;
    },
  },
};
