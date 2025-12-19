import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Post, Comment, Lens, Reaction } from './models';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/burrow';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Lens.deleteMany({}),
      Reaction.deleteMany({}),
    ]);

    console.log('Creating users...');
    const users = await User.create([
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        bio: 'Tech enthusiast and avid reader',
        role: 'admin',
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        bio: 'Software developer by day, gamer by night',
        role: 'moderator',
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'password123',
        bio: 'Love discussing ideas and meeting new people',
      },
      {
        username: 'diana',
        email: 'diana@example.com',
        password: 'password123',
        bio: 'Artist and creative thinker',
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123',
        bio: 'Test account for demo purposes',
      },
    ]);

    console.log(`Created ${users.length} users`);

    console.log('Creating posts...');
    const posts = await Post.create([
      {
        type: 'text',
        title: 'Welcome to Burrow!',
        content:
          'This is the first post on our Reddit-like platform. Feel free to share your thoughts, create communities, and engage in meaningful discussions.',
        author: users[0]._id,
        tags: ['welcome', 'intro', 'community'],
        reactionsCount: 5,
        commentsCount: 2,
      },
      {
        type: 'link',
        title: 'Interesting Article About Web Development',
        content: 'Found this great article about modern web development practices.',
        author: users[1]._id,
        linkUrl: 'https://developer.mozilla.org/en-US/docs/Web',
        tags: ['webdev', 'programming', 'learning'],
        reactionsCount: 3,
      },
      {
        type: 'poll',
        title: 'What is your favorite programming language?',
        content: 'Vote for your favorite programming language!',
        author: users[2]._id,
        poll: {
          question: 'Which programming language do you prefer?',
          options: [
            { id: '1', text: 'TypeScript', votes: 8, voters: [] },
            { id: '2', text: 'Python', votes: 6, voters: [] },
            { id: '3', text: 'Rust', votes: 4, voters: [] },
            { id: '4', text: 'Go', votes: 3, voters: [] },
          ],
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        tags: ['poll', 'programming', 'languages'],
        reactionsCount: 2,
      },
      {
        type: 'text',
        title: 'Daily Discussion Thread',
        content:
          'Use this thread to discuss anything and everything. What are you working on today? Any interesting discoveries?',
        author: users[0]._id,
        tags: ['discussion', 'daily'],
        reactionsCount: 1,
        commentsCount: 3,
      },
      {
        type: 'image',
        title: 'Beautiful Sunset from my balcony',
        content: 'Captured this amazing view yesterday evening',
        author: users[3]._id,
        imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869',
        tags: ['photography', 'nature', 'sunset'],
        reactionsCount: 7,
      },
      {
        type: 'text',
        title: 'Ephemeral Thread - 24h only',
        content:
          'This is an ephemeral thread that will disappear in 24 hours. Perfect for temporary discussions!',
        author: users[1]._id,
        ephemeralUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tags: ['ephemeral', 'temporary'],
        reactionsCount: 2,
      },
      {
        type: 'text',
        title: 'Tips for Better Code Reviews',
        content:
          'Here are some tips I have learned over the years:\n1. Be constructive\n2. Focus on the code, not the person\n3. Ask questions instead of making demands\n4. Acknowledge good code too',
        author: users[2]._id,
        tags: ['programming', 'tips', 'code-review'],
        reactionsCount: 12,
        commentsCount: 4,
      },
    ]);

    console.log(`Created ${posts.length} posts`);

    console.log('Creating comments...');
    const comments = await Comment.create([
      {
        post: posts[0]._id,
        author: users[1]._id,
        text: 'Great to be here! Looking forward to awesome discussions.',
      },
      {
        post: posts[0]._id,
        author: users[2]._id,
        text: 'Welcome everyone! This platform looks promising.',
      },
      {
        post: posts[3]._id,
        author: users[3]._id,
        text: 'Working on a new art project today. Feeling inspired!',
      },
      {
        post: posts[3]._id,
        author: users[0]._id,
        text: 'That sounds exciting! Would love to see it when done.',
      },
      {
        post: posts[3]._id,
        author: users[1]._id,
        text: 'Debugging some tricky async code. Coffee is my best friend today.',
      },
      {
        post: posts[6]._id,
        author: users[0]._id,
        text: 'Tip #3 is so important! Questions create dialogue, demands create defensiveness.',
      },
      {
        post: posts[6]._id,
        author: users[3]._id,
        text: 'I always try to start with something positive before any criticism.',
      },
    ]);

    console.log(`Created ${comments.length} comments`);

    console.log('Creating lenses...');
    const lenses = await Lens.create([
      {
        name: 'Popular Posts',
        description: 'Posts with high engagement',
        rules: [{ type: 'minReactions', value: '5' }],
        author: users[0]._id,
        isPublic: true,
        pinned: true,
        usageCount: 15,
      },
      {
        name: 'Programming',
        description: 'All programming related posts',
        rules: [{ type: 'hasTag', value: 'programming' }],
        author: users[1]._id,
        isPublic: true,
        usageCount: 8,
      },
      {
        name: 'Polls Only',
        description: 'Show only poll posts',
        rules: [{ type: 'postType', value: 'poll' }],
        author: users[2]._id,
        isPublic: true,
        usageCount: 5,
      },
      {
        name: 'My Mentions',
        description: 'Posts that mention me',
        rules: [{ type: 'containsText', value: '@charlie' }],
        author: users[2]._id,
        isPublic: false,
        usageCount: 2,
      },
    ]);

    console.log(`Created ${lenses.length} lenses`);

    console.log('Creating reactions...');
    const reactions = await Reaction.create([
      { user: users[1]._id, targetType: 'post', targetId: posts[0]._id, type: 'like' },
      { user: users[2]._id, targetType: 'post', targetId: posts[0]._id, type: 'love' },
      { user: users[3]._id, targetType: 'post', targetId: posts[0]._id, type: 'like' },
      { user: users[0]._id, targetType: 'post', targetId: posts[1]._id, type: 'like' },
      { user: users[2]._id, targetType: 'post', targetId: posts[4]._id, type: 'love' },
      { user: users[0]._id, targetType: 'post', targetId: posts[6]._id, type: 'like' },
      { user: users[1]._id, targetType: 'comment', targetId: comments[0]._id, type: 'like' },
    ]);

    console.log(`Created ${reactions.length} reactions`);

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log('\nTest Credentials:');
    console.log('  Email: test@example.com');
    console.log('  Password: test123');
    console.log('\nAdmin Credentials:');
    console.log('  Email: alice@example.com');
    console.log('  Password: password123');
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
