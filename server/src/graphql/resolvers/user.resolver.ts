import { User, Post, Comment, IUser } from '../../models';
import { AuthenticationError, ForbiddenError } from '../../utils/errors';
import { validate, updateProfileSchema } from '../../utils/validators';
import { Context, requireAuth } from '../context';

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  avatar?: string;
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

    deleteAccount: async (_: unknown, __: unknown, context: Context) => {
      const currentUser = requireAuth(context);

      await User.findByIdAndUpdate(currentUser._id, { isDeleted: true });

      return {
        success: true,
        message: 'Account deleted successfully',
      };
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
  },
};
