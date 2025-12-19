import mongoose from 'mongoose';
import { Comment, Post, User } from '../../models';

describe('Comment Model', () => {
  let testUser: mongoose.Types.ObjectId;
  let testPost: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    testUser = user._id;

    const post = await Post.create({
      type: 'text',
      title: 'Test Post',
      content: 'Post content',
      author: testUser,
    });
    testPost = post._id;
  });

  describe('Comment creation', () => {
    it('should create a comment with valid data', async () => {
      const comment = await Comment.create({
        post: testPost,
        author: testUser,
        text: 'This is a test comment',
      });

      expect(comment.text).toBe('This is a test comment');
      expect(comment.depth).toBe(0);
      expect(comment.isDeleted).toBe(false);
      expect(comment.reactionsCount).toBe(0);
    });

    it('should fail validation for empty comment text', async () => {
      await expect(
        Comment.create({
          post: testPost,
          author: testUser,
          text: '',
        })
      ).rejects.toThrow();
    });

    it('should fail validation for comment exceeding max length', async () => {
      const longText = 'a'.repeat(5001);
      await expect(
        Comment.create({
          post: testPost,
          author: testUser,
          text: longText,
        })
      ).rejects.toThrow();
    });
  });

  describe('Nested comments', () => {
    it('should create a reply to a comment', async () => {
      const parentComment = await Comment.create({
        post: testPost,
        author: testUser,
        text: 'Parent comment',
        depth: 0,
      });

      const replyComment = await Comment.create({
        post: testPost,
        author: testUser,
        text: 'Reply comment',
        parentComment: parentComment._id,
        depth: 1,
      });

      expect(replyComment.parentComment?.toString()).toBe(parentComment._id.toString());
      expect(replyComment.depth).toBe(1);
    });
  });
});
