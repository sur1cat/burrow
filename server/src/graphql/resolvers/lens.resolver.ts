import { Lens, ILens } from '../../models';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { validate, createLensSchema, updateLensSchema } from '../../utils/validators';
import { Context, requireAuth } from '../context';

export interface CreateLensInput {
  name: string;
  description?: string;
  rules: { type: string; value: string }[];
  isPublic?: boolean;
  pinned?: boolean;
}

export interface UpdateLensInput {
  name?: string;
  description?: string;
  rules?: { type: string; value: string }[];
  isPublic?: boolean;
  pinned?: boolean;
}

export const lensResolvers = {
  Query: {
    lenses: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) {
        return Lens.find({ isPublic: true, isDeleted: false })
          .populate('author')
          .sort({ usageCount: -1 });
      }

      return Lens.find({
        $or: [{ author: context.user._id }, { isPublic: true }],
        isDeleted: false,
      })
        .populate('author')
        .sort({ usageCount: -1 });
    },

    lens: async (_: unknown, { id }: { id: string }, context: Context) => {
      const lens = await Lens.findOne({ _id: id, isDeleted: false }).populate('author');
      if (!lens) {
        throw new NotFoundError('Lens');
      }

      if (!lens.isPublic && (!context.user || lens.author._id.toString() !== context.user._id.toString())) {
        throw new ForbiddenError('You do not have access to this lens');
      }

      return lens;
    },

    myLenses: async (_: unknown, __: unknown, context: Context) => {
      const currentUser = requireAuth(context);

      return Lens.find({ author: currentUser._id, isDeleted: false })
        .populate('author')
        .sort({ createdAt: -1 });
    },

    publicLenses: async () => {
      return Lens.find({ isPublic: true, isDeleted: false })
        .populate('author')
        .sort({ usageCount: -1 });
    },
  },

  Mutation: {
    createLens: async (
      _: unknown,
      { input }: { input: CreateLensInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(createLensSchema, input);

      const lens = await Lens.create({
        ...validatedInput,
        author: currentUser._id,
      });

      return Lens.findById(lens._id).populate('author');
    },

    updateLens: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateLensInput },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      const validatedInput = validate(updateLensSchema, input);

      const lens = await Lens.findOne({ _id: id, isDeleted: false });
      if (!lens) {
        throw new NotFoundError('Lens');
      }

      if (lens.author.toString() !== currentUser._id.toString()) {
        throw new ForbiddenError('You can only edit your own lenses');
      }

      const updatedLens = await Lens.findByIdAndUpdate(
        id,
        { $set: validatedInput },
        { new: true, runValidators: true }
      ).populate('author');

      return updatedLens;
    },

    deleteLens: async (_: unknown, { id }: { id: string }, context: Context) => {
      const currentUser = requireAuth(context);

      const lens = await Lens.findOne({ _id: id, isDeleted: false });
      if (!lens) {
        throw new NotFoundError('Lens');
      }

      if (lens.author.toString() !== currentUser._id.toString()) {
        throw new ForbiddenError('You can only delete your own lenses');
      }

      await Lens.findByIdAndUpdate(id, { isDeleted: true });

      return {
        success: true,
        message: 'Lens deleted successfully',
      };
    },
  },

  Lens: {
    id: (parent: ILens) => parent._id.toString(),

    author: async (parent: ILens) => {
      if (parent.author && typeof parent.author === 'object' && 'username' in parent.author) {
        return parent.author;
      }
      const { User } = await import('../../models');
      return User.findById(parent.author);
    },

    rules: (parent: ILens) => {
      return parent.rules.map((rule) => ({
        type: rule.type,
        value: String(rule.value),
      }));
    },
  },
};
