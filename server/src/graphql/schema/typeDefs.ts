import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  enum PostType {
    text
    link
    image
    poll
  }

  enum ReactionType {
    like
    dislike
    love
    laugh
    wow
    sad
    angry
  }

  enum ReactionTarget {
    post
    comment
  }

  enum LensRuleType {
    minReactions
    author
    containsText
    hasTag
    postType
  }

  enum UserRole {
    user
    moderator
    admin
  }

  type User {
    id: ID!
    username: String!
    email: String!
    bio: String
    avatar: String
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastSeen: DateTime
    isOnline: Boolean!
    posts: [Post!]
    savedPosts: [Post!]
    postsCount: Int!
    commentsCount: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PollOption {
    id: String!
    text: String!
    votes: Int!
    hasVoted: Boolean!
  }

  type Poll {
    question: String!
    options: [PollOption!]!
    endsAt: DateTime
    totalVotes: Int!
  }

  type Post {
    id: ID!
    type: PostType!
    title: String!
    content: String!
    author: User!
    linkUrl: String
    imageUrl: String
    poll: Poll
    tags: [String!]!
    reactionsCount: Int!
    commentsCount: Int!
    ephemeralUntil: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    hasReacted: Boolean
    userReactionType: ReactionType
    comments: [Comment!]
  }

  type Comment {
    id: ID!
    post: Post!
    author: User!
    text: String!
    parentComment: Comment
    depth: Int!
    reactionsCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    hasReacted: Boolean
    replies: [Comment!]
  }

  type LensRule {
    type: LensRuleType!
    value: String!
  }

  type Lens {
    id: ID!
    name: String!
    description: String
    rules: [LensRule!]!
    author: User!
    isPublic: Boolean!
    pinned: Boolean!
    usageCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Reaction {
    id: ID!
    user: User!
    targetType: ReactionTarget!
    targetId: ID!
    type: ReactionType!
    createdAt: DateTime!
  }

  type PaginatedPosts {
    posts: [Post!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type DeleteResult {
    success: Boolean!
    message: String!
  }

  type UsernameAvailability {
    available: Boolean!
    reason: String
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    username: String
    bio: String
    avatar: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input PollOptionInput {
    text: String!
  }

  input PollInput {
    question: String!
    options: [PollOptionInput!]!
    endsAt: DateTime
  }

  input CreatePostInput {
    type: PostType!
    title: String!
    content: String!
    linkUrl: String
    imageUrl: String
    poll: PollInput
    tags: [String!]
    ephemeralUntil: DateTime
  }

  input UpdatePostInput {
    title: String
    content: String
    linkUrl: String
    imageUrl: String
    tags: [String!]
  }

  input LensRuleInput {
    type: LensRuleType!
    value: String!
  }

  input CreateLensInput {
    name: String!
    description: String
    rules: [LensRuleInput!]!
    isPublic: Boolean
    pinned: Boolean
  }

  input UpdateLensInput {
    name: String
    description: String
    rules: [LensRuleInput!]
    isPublic: Boolean
    pinned: Boolean
  }

  input PostFilterInput {
    type: PostType
    authorId: ID
    tags: [String!]
    minReactions: Int
    searchText: String
  }

  type Query {
    me: User
    user(id: ID!): User
    userByUsername(username: String!): User
    users(limit: Int, offset: Int): [User!]!
    checkUsernameAvailable(username: String!): UsernameAvailability!

    posts(limit: Int, offset: Int, filter: PostFilterInput): PaginatedPosts!
    post(id: ID!): Post
    postsByUser(userId: ID!, limit: Int, offset: Int): [Post!]!
    comments(postId: ID!): [Comment!]!
    comment(id: ID!): Comment
    lenses: [Lens!]!
    lens(id: ID!): Lens
    myLenses: [Lens!]!
    publicLenses: [Lens!]!
    reactions(targetType: ReactionTarget!, targetId: ID!): [Reaction!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    deleteAccount: DeleteResult!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): DeleteResult!
    votePoll(postId: ID!, optionId: String!): Post!
    addComment(postId: ID!, text: String!, parentCommentId: ID): Comment!
    updateComment(id: ID!, text: String!): Comment!
    deleteComment(id: ID!): DeleteResult!
    createLens(input: CreateLensInput!): Lens!
    updateLens(id: ID!, input: UpdateLensInput!): Lens!
    deleteLens(id: ID!): DeleteResult!
    toggleReaction(targetType: ReactionTarget!, targetId: ID!, type: ReactionType!): Boolean!
    savePost(postId: ID!): Boolean!
    unsavePost(postId: ID!): Boolean!
    heartbeat: Boolean!
  }

  type Subscription {
    commentAdded(postId: ID!): Comment!
    postUpdated(postId: ID): Post!
    reactionToggled(targetType: ReactionTarget!, targetId: ID!): Reaction
  }
`;
