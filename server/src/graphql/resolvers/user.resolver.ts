import mongoose from 'mongoose';
import { User, Post, Comment, IUser } from '../../models';
import { AuthenticationError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { validate, updateProfileSchema } from '../../utils/validators';
import { Context, requireAuth } from '../context';

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const userResolvers = {
  Mutation: {
    updateProfile: async (
      _: unknown,
      { input }: { input: UpdateProfileInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(updateProfileSchema, input);

      if (validatedInput.username && validatedInput.username !== currentUser.username) {
        const existingUser = await User.findOne({
          username: validatedInput.username,
          _id: { $ne: currentUser._id },
        });
        if (existingUser) {
          throw new ForbiddenError('Username already taken');
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        currentUser._id,
        { $set: validatedInput },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    changePassword: async (
      _: unknown,
      { input }: { input: ChangePasswordInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);

      const user = await User.findById(currentUser._id).select('+password');
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const isValidPassword = await user.comparePassword(input.currentPassword);
      if (!isValidPassword) {
        throw new AuthenticationError('Current password is incorrect');
      }

      if (input.newPassword.length < 6) {
        throw new ForbiddenError('New password must be at least 6 characters');
      }

      user.password = input.newPassword;
      await user.save();

      return true;
    },

    deleteAccount: async (_: unknown, __: unknown, context: Context) => {
      const currentUser = requireAuth(context);

      await User.findByIdAndUpdate(currentUser._id, { isDeleted: true });

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    },

    savePost: async (
      _: unknown,
      { postId }: { postId: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const postObjectId = new mongoose.Types.ObjectId(postId);

      const post = await Post.findOne({ _id: postObjectId, isDeleted: false });
      if (!post) {
        throw new NotFoundError('Post');
      }

      await User.findByIdAndUpdate(
        currentUser._id,
        { $addToSet: { savedPosts: postObjectId } }
      );

      return true;
    },

    unsavePost: async (
      _: unknown,
      { postId }: { postId: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const postObjectId = new mongoose.Types.ObjectId(postId);

      await User.findByIdAndUpdate(
        currentUser._id,
        { $pull: { savedPosts: postObjectId } }
      );

      return true;
    },

    heartbeat: async (_: unknown, __: unknown, context: Context) => {
      const currentUser = requireAuth(context);

      await User.findByIdAndUpdate(
        currentUser._id,
        { lastSeen: new Date() }
      );

      return true;
    },
  },

  User: {
    id: (parent: IUser & { id?: string }) => parent._id?.toString() ?? parent.id,

    posts: async (parent: IUser) => {
      return Post.find({ author: parent._id, isDeleted: false })
        .populate('author')
        .sort({ createdAt: -1 });
    },

    postsCount: async (parent: IUser) => {
      return Post.countDocuments({ author: parent._id, isDeleted: false });
    },

    commentsCount: async (parent: IUser) => {
      return Comment.countDocuments({ author: parent._id, isDeleted: false });
    },

    savedPosts: async (parent: IUser) => {
      const user = await User.findById(parent._id).populate({
        path: 'savedPosts',
        match: { isDeleted: false },
        populate: { path: 'author', select: 'id username avatar' }
      });
      return user?.savedPosts || [];
    },

    isOnline: (parent: IUser) => {
      if (!parent.lastSeen) return false;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return new Date(parent.lastSeen) > fiveMinutesAgo;
    },

    lastSeen: (parent: IUser) => parent.lastSeen,
  },
};
