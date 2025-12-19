import {
  validate,
  registerSchema,
  loginSchema,
  createPostSchema,
  commentSchema,
} from '../../utils/validators';
import { ValidationError } from '../../utils/errors';

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123',
      };

      expect(() => validate(registerSchema, data)).not.toThrow();
    });

    it('should reject short username', () => {
      const data = {
        username: 'ab',
        email: 'valid@example.com',
        password: 'password123',
      };

      expect(() => validate(registerSchema, data)).toThrow(ValidationError);
    });

    it('should reject invalid email', () => {
      const data = {
        username: 'validuser',
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => validate(registerSchema, data)).toThrow(ValidationError);
    });

    it('should reject short password', () => {
      const data = {
        username: 'validuser',
        email: 'valid@example.com',
        password: '12345',
      };

      expect(() => validate(registerSchema, data)).toThrow(ValidationError);
    });

    it('should reject username with special characters', () => {
      const data = {
        username: 'user@name!',
        email: 'valid@example.com',
        password: 'password123',
      };

      expect(() => validate(registerSchema, data)).toThrow(ValidationError);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'valid@example.com',
        password: 'password123',
      };

      expect(() => validate(loginSchema, data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid',
        password: 'password123',
      };

      expect(() => validate(loginSchema, data)).toThrow(ValidationError);
    });
  });

  describe('createPostSchema', () => {
    it('should validate correct text post data', () => {
      const data = {
        type: 'text',
        title: 'Test Title',
        content: 'Test content',
      };

      expect(() => validate(createPostSchema, data)).not.toThrow();
    });

    it('should validate link post with URL', () => {
      const data = {
        type: 'link',
        title: 'Link Post',
        content: 'Check this out',
        linkUrl: 'https://example.com',
      };

      expect(() => validate(createPostSchema, data)).not.toThrow();
    });

    it('should reject empty title', () => {
      const data = {
        type: 'text',
        title: '',
        content: 'Test content',
      };

      expect(() => validate(createPostSchema, data)).toThrow(ValidationError);
    });

    it('should reject title exceeding max length', () => {
      const data = {
        type: 'text',
        title: 'a'.repeat(301),
        content: 'Test content',
      };

      expect(() => validate(createPostSchema, data)).toThrow(ValidationError);
    });
  });

  describe('commentSchema', () => {
    it('should validate correct comment data', () => {
      const data = {
        text: 'This is a valid comment',
      };

      expect(() => validate(commentSchema, data)).not.toThrow();
    });

    it('should reject empty comment', () => {
      const data = {
        text: '',
      };

      expect(() => validate(commentSchema, data)).toThrow(ValidationError);
    });
  });
});
