import { User } from '../../models';
import { generateToken } from '../../utils/auth';
import { AuthenticationError, ConflictError, NotFoundError } from '../../utils/errors';
import { validate, registerSchema, loginSchema } from '../../utils/validators';
import { Context } from '../context';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authResolvers = {
  Mutation: {
    register: async (_: unknown, { input }: { input: RegisterInput }) => {
      const validatedInput = validate(registerSchema, input);

      const existingUser = await User.findOne({
        $or: [
          { email: validatedInput.email.toLowerCase() },
          { username: validatedInput.username },
        ],
      });

      if (existingUser) {
        if (existingUser.email === validatedInput.email.toLowerCase()) {
          throw new ConflictError('Email already registered');
        }
        throw new ConflictError('Username already taken');
      }

      const user = await User.create({
        username: validatedInput.username,
        email: validatedInput.email.toLowerCase(),
        password: validatedInput.password,
      });

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    },

    login: async (_: unknown, { input }: { input: LoginInput }) => {
      const validatedInput = validate(loginSchema, input);

      const user = await User.findOne({
        email: validatedInput.email.toLowerCase(),
        isDeleted: false,
      }).select('+password');

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(validatedInput.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    },
  },

  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) {
        return null;
      }

      const user = await User.findById(context.user._id);
      if (!user || user.isDeleted) {
        return null;
      }

      return user;
    },

    user: async (_: unknown, { id }: { id: string }) => {
      const user = await User.findOne({ _id: id, isDeleted: false });
      if (!user) {
        throw new NotFoundError('User');
      }
      return user;
    },

    users: async (_: unknown, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      return User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },
  },
};
