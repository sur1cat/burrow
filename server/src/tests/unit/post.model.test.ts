import mongoose from 'mongoose';
import { Post, User } from '../../models';

describe('Post Model', () => {
  let testUser: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    testUser = user._id;
  });

  describe('Post creation', () => {
    it('should create a text post with valid data', async () => {
      const post = await Post.create({
        type: 'text',
        title: 'Test Post',
        content: 'This is a test post content',
        author: testUser,
      });

      expect(post.title).toBe('Test Post');
      expect(post.content).toBe('This is a test post content');
      expect(post.type).toBe('text');
      expect(post.isDeleted).toBe(false);
      expect(post.reactionsCount).toBe(0);
      expect(post.commentsCount).toBe(0);
    });

    it('should create a link post with URL', async () => {
      const post = await Post.create({
        type: 'link',
        title: 'Link Post',
        content: 'Check out this link',
        author: testUser,
        linkUrl: 'https://example.com',
      });

      expect(post.type).toBe('link');
      expect(post.linkUrl).toBe('https://example.com');
    });

    it('should create a poll post with options', async () => {
      const post = await Post.create({
        type: 'poll',
        title: 'Poll Post',
        content: 'Vote here',
        author: testUser,
        poll: {
          question: 'What is your favorite color?',
          options: [
            { id: '1', text: 'Red', votes: 0, voters: [] },
            { id: '2', text: 'Blue', votes: 0, voters: [] },
          ],
          endsAt: null,
        },
      });

      expect(post.type).toBe('poll');
      expect(post.poll?.question).toBe('What is your favorite color?');
      expect(post.poll?.options.length).toBe(2);
    });

    it('should fail validation for empty title', async () => {
      await expect(
        Post.create({
          type: 'text',
          title: '',
          content: 'Content here',
          author: testUser,
        })
      ).rejects.toThrow();
    });
  });

  describe('Post with ephemeral', () => {
    it('should create ephemeral post with expiry date', async () => {
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const post = await Post.create({
        type: 'text',
        title: 'Ephemeral Post',
        content: 'This will expire',
        author: testUser,
        ephemeralUntil: expiryDate,
      });

      expect(post.ephemeralUntil).toEqual(expiryDate);
    });
  });

  describe('Post tags', () => {
    it('should create post with tags', async () => {
      const post = await Post.create({
        type: 'text',
        title: 'Tagged Post',
        content: 'Content with tags',
        author: testUser,
        tags: ['tag1', 'tag2', 'tag3'],
      });

      expect(post.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
});
