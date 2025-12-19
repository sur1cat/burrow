import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthContext {
  user: IUser | null;
  userId: string | null;
}

export function generateToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}
