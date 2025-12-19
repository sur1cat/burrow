import { User } from '../../models';

describe('User Model', () => {
  describe('User creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
      expect(user.isDeleted).toBe(false);
      expect(user.password).not.toBe('password123');
    });

    it('should hash the password before saving', async () => {
      const user = await User.create({
        username: 'hashtest',
        email: 'hash@example.com',
        password: 'plainpassword',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      expect(userWithPassword?.password).not.toBe('plainpassword');
      expect(userWithPassword?.password.length).toBeGreaterThan(50);
    });

    it('should fail validation for invalid email', async () => {
      await expect(
        User.create({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should fail validation for short username', async () => {
      await expect(
        User.create({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should fail validation for short password', async () => {
      await expect(
        User.create({
          username: 'testuser',
          email: 'test@example.com',
          password: '12345',
        })
      ).rejects.toThrow();
    });
  });

  describe('Password comparison', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'correctpassword',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword!.comparePassword('correctpassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'correctpassword',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword!.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Unique constraints', () => {
    it('should not allow duplicate emails', async () => {
      await User.create({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      await expect(
        User.create({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should not allow duplicate usernames', async () => {
      await User.create({
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: 'password123',
      });

      await expect(
        User.create({
          username: 'duplicateuser',
          email: 'user2@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });
  });
});
