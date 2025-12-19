import { z } from 'zod';
import { ValidationError } from './errors';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const createPostSchema = z.object({
  type: z.enum(['text', 'link', 'image', 'poll']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(300, 'Title cannot exceed 300 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content cannot exceed 10000 characters'),
  linkUrl: z.string().url('Invalid URL').optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  poll: z
    .object({
      question: z.string().min(1).max(300),
      options: z
        .array(z.object({ text: z.string().min(1).max(200) }))
        .min(2, 'Poll must have at least 2 options')
        .max(10, 'Poll cannot have more than 10 options'),
      endsAt: z.string().datetime().optional().nullable(),
    })
    .optional()
    .nullable(),
  tags: z.array(z.string()).max(10, 'Cannot have more than 10 tags').optional(),
  ephemeralUntil: z.string().datetime().optional().nullable(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(10000).optional(),
  linkUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
});

export const createLensSchema = z.object({
  name: z
    .string()
    .min(1, 'Lens name is required')
    .max(50, 'Lens name cannot exceed 50 characters'),
  description: z.string().max(200).optional(),
  rules: z
    .array(
      z.object({
        type: z.enum(['minReactions', 'author', 'containsText', 'hasTag', 'postType']),
        value: z.string(),
      })
    )
    .min(1, 'At least one rule is required')
    .max(10, 'Cannot have more than 10 rules'),
  isPublic: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export const updateLensSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  rules: z
    .array(
      z.object({
        type: z.enum(['minReactions', 'author', 'containsText', 'hasTag', 'postType']),
        value: z.string(),
      })
    )
    .min(1)
    .max(10)
    .optional(),
  isPublic: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new ValidationError(firstError.message, firstError.path.join('.'));
  }
  return result.data;
}
