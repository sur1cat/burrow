import { Request } from 'express';
import { User, IUser } from '../models';
import { extractTokenFromHeader, verifyToken } from '../utils/auth';

export interface Context {
  user: IUser | null;
  userId: string | null;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return { user: null, userId: null };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { user: null, userId: null };
  }

  const user = await User.findById(payload.userId);
  if (!user || user.isDeleted) {
    return { user: null, userId: null };
  }

  return {
    user,
    userId: user._id.toString(),
  };
}

export function requireAuth(context: Context): IUser {
  if (!context.user) {
    throw new Error('You must be logged in to perform this action');
  }
  return context.user;
}
