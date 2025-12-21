import mongoose from 'mongoose';
import { Post, Comment, Reaction, User, IPost } from '../../models';
import { AuthenticationError, ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors';
import { validate, createPostSchema, updatePostSchema } from '../../utils/validators';
import { Context, requireAuth } from '../context';
import { pubsub, POST_UPDATED } from './subscriptions';

export interface CreatePostInput {
  type: 'text' | 'link' | 'image' | 'poll';
  title: string;
  content: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  poll?: {
    question: string;
    options: { text: string }[];
    endsAt?: string | null;
  } | null;
  tags?: string[];
  ephemeralUntil?: string | null;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  tags?: string[];
}

export interface PostFilterInput {
  type?: string;
  authorId?: string;
  tags?: string[];
  minReactions?: number;
  searchText?: string;
}

export const postResolvers = {
  Query: {
    posts: async (
      _: unknown,
      {
        limit = 20,
        offset = 0,
        filter,
      }: { limit?: number; offset?: number; filter?: PostFilterInput }
    ) => {
      const query: Record<string, unknown> = {
        isDeleted: false,
        $or: [
          { ephemeralUntil: null },
          { ephemeralUntil: { $gt: new Date() } },
        ],
      };

      if (filter) {
        if (filter.type) query.type = filter.type;
        if (filter.authorId) query.author = new mongoose.Types.ObjectId(filter.authorId);
        if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };
        if (filter.minReactions) query.reactionsCount = { $gte: filter.minReactions };
        if (filter.searchText) {
          query.$or = [
            { title: { $regex: filter.searchText, $options: 'i' } },
            { content: { $regex: filter.searchText, $options: 'i' } },
          ];
        }
      }

      const [posts, totalCount] = await Promise.all([
        Post.find(query)
          .populate('author')
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit),
        Post.countDocuments(query),
      ]);

      return {
        posts,
        totalCount,
        hasMore: offset + posts.length < totalCount,
      };
    },

    post: async (_: unknown, { id }: { id: string }) => {
      const post = await Post.findOne({ _id: id, isDeleted: false }).populate('author');
      if (!post) {
        throw new NotFoundError('Post');
      }
      return post;
    },

    postsByUser: async (
      _: unknown,
      { userId, limit = 20, offset = 0 }: { userId: string; limit?: number; offset?: number }
    ) => {
      return Post.find({
        author: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      })
        .populate('author')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },
  },

  Mutation: {
    createPost: async (
      _: unknown,
      { input }: { input: CreatePostInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(createPostSchema, input);

      if (validatedInput.type === 'link' && !validatedInput.linkUrl) {
        throw new ValidationError('Link URL is required for link posts', 'linkUrl');
      }
      if (validatedInput.type === 'image' && !validatedInput.imageUrl) {
        throw new ValidationError('Image URL is required for image posts', 'imageUrl');
      }
      if (validatedInput.type === 'poll' && !validatedInput.poll) {
        throw new ValidationError('Poll data is required for poll posts', 'poll');
      }

      const postData: Record<string, unknown> = {
        type: validatedInput.type,
        title: validatedInput.title,
        content: validatedInput.content,
        author: currentUser._id,
        tags: validatedInput.tags || [],
      };

      if (validatedInput.linkUrl) postData.linkUrl = validatedInput.linkUrl;
      if (validatedInput.imageUrl) postData.imageUrl = validatedInput.imageUrl;
      if (validatedInput.ephemeralUntil) {
        postData.ephemeralUntil = new Date(validatedInput.ephemeralUntil);
      }

      if (validatedInput.poll) {
        postData.poll = {
          question: validatedInput.poll.question,
          options: validatedInput.poll.options.map((opt, idx) => ({
            id: String(idx + 1),
            text: opt.text,
            votes: 0,
            voters: [],
          })),
          endsAt: validatedInput.poll.endsAt ? new Date(validatedInput.poll.endsAt) : null,
        };
      }

      const post = await Post.create(postData);
      return Post.findById(post._id).populate('author');
    },

    updatePost: async (
      _: unknown,
      { id, input }: { id: string; input: UpdatePostInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(updatePostSchema, input);

      const post = await Post.findOne({ _id: id, isDeleted: false });
      if (!post) {
        throw new NotFoundError('Post');
      }

      if (post.author.toString() !== currentUser._id.toString()) {
        throw new ForbiddenError('You can only edit your own posts');
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { $set: validatedInput },
        { new: true, runValidators: true }
      ).populate('author');

      pubsub.publish(POST_UPDATED, { postUpdated: updatedPost });

      return updatedPost;
    },

    deletePost: async (_: unknown, { id }: { id: string }, context: Context) => {
      const currentUser = requireAuth(context);

      const post = await Post.findOne({ _id: id, isDeleted: false });
      if (!post) {
        throw new NotFoundError('Post');
      }

      if (
        post.author.toString() !== currentUser._id.toString() &&
        currentUser.role !== 'admin' &&
        currentUser.role !== 'moderator'
      ) {
        throw new ForbiddenError('You can only delete your own posts');
      }

      await Post.findByIdAndUpdate(id, { isDeleted: true });
      await Comment.updateMany({ post: id }, { isDeleted: true });

      return {
        success: true,
        message: 'Post deleted successfully',
      };
    },

    votePoll: async (
      _: unknown,
      { postId, optionId }: { postId: string; optionId: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);

      const post = await Post.findOne({ _id: postId, isDeleted: false, type: 'poll' });
      if (!post) {
        throw new NotFoundError('Poll post');
      }

      if (!post.poll) {
        throw new ValidationError('This post does not have a poll');
      }

      if (post.poll.endsAt && new Date() > post.poll.endsAt) {
        throw new ValidationError('This poll has ended');
      }

      const option = post.poll.options.find((opt) => opt.id === optionId);
      if (!option) {
        throw new ValidationError('Invalid poll option');
      }

      const hasVoted = post.poll.options.some((opt) =>
        opt.voters.some((v) => v.toString() === currentUser._id.toString())
      );

      if (hasVoted) {
        throw new ValidationError('You have already voted in this poll');
      }

      option.votes += 1;
      option.voters.push(currentUser._id);
      await post.save();

      return Post.findById(postId).populate('author');
    },
  },

  Post: {
    id: (parent: IPost) => parent._id.toString(),

    author: async (parent: IPost) => {
      if (parent.author && typeof parent.author === 'object' && 'username' in parent.author) {
        return parent.author;
      }
      const { User } = await import('../../models');
      return User.findById(parent.author);
    },

    comments: async (parent: IPost) => {
      return Comment.find({ post: parent._id, isDeleted: false })
        .populate('author')
        .sort({ createdAt: 1 });
    },

    hasReacted: async (parent: IPost, _: unknown, context: Context) => {
      if (!context.user) return false;
      const reaction = await Reaction.findOne({
        user: context.user._id,
        targetType: 'post',
        targetId: parent._id,
      });
      return !!reaction;
    },

    userReactionType: async (parent: IPost, _: unknown, context: Context) => {
      if (!context.user) return null;
      const reaction = await Reaction.findOne({
        user: context.user._id,
        targetType: 'post',
        targetId: parent._id,
      });
      return reaction?.type || null;
    },

    poll: (parent: IPost, _: unknown, context: Context) => {
      if (!parent.poll) return null;

      return {
        question: parent.poll.question,
        options: parent.poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes,
          hasVoted: context.user
            ? opt.voters.some((v) => v.toString() === context.user?._id.toString())
            : false,
        })),
        endsAt: parent.poll.endsAt,
        totalVotes: parent.poll.options.reduce((sum, opt) => sum + opt.votes, 0),
      };
    },

    isSaved: async (parent: IPost, _: unknown, context: Context) => {
      if (!context.user) return false;
      const user = await User.findById(context.user._id);
      if (!user) return false;
      return user.savedPosts.some(
        (postId) => postId.toString() === parent._id.toString()
      );
    },
  },
};
