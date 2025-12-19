import mongoose from 'mongoose';
import { generateToken, verifyToken, extractTokenFromHeader } from '../../utils/auth';
import { User, IUser } from '../../models';

describe('Auth Utilities', () => {
  let testUser: IUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testUser);
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(testUser._id.toString());
      expect(payload?.email).toBe(testUser.email);
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should return null for empty token', () => {
      const payload = verifyToken('');
      expect(payload).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = extractTokenFromHeader('Bearer abc123token');
      expect(token).toBe('abc123token');
    });

    it('should return null for missing header', () => {
      const token = extractTokenFromHeader(undefined);
      expect(token).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const token = extractTokenFromHeader('abc123token');
      expect(token).toBeNull();
    });

    it('should return null for header with wrong prefix', () => {
      const token = extractTokenFromHeader('Basic abc123token');
      expect(token).toBeNull();
    });
  });
});
