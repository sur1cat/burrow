import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type PostType = 'text' | 'link' | 'image' | 'poll';

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
  voters: Types.ObjectId[];
}

export interface IPoll {
  question: string;
  options: IPollOption[];
  endsAt: Date | null;
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  type: PostType;
  title: string;
  content: string;
  author: Types.ObjectId;
  linkUrl: string | null;
  imageUrl: string | null;
  poll: IPoll | null;
  tags: string[];
  reactionsCount: number;
  commentsCount: number;
  ephemeralUntil: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IPostModel extends Model<IPost> {
  findActive(): Promise<IPost[]>;
  findByAuthor(authorId: Types.ObjectId): Promise<IPost[]>;
}

const pollOptionSchema = new Schema<IPollOption>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, maxlength: 200 },
    votes: { type: Number, default: 0 },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: false }
);

const pollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true, maxlength: 300 },
    options: { type: [pollOptionSchema], validate: [
      (v: IPollOption[]) => v.length >= 2 && v.length <= 10,
      'Poll must have between 2 and 10 options'
    ]},
    endsAt: { type: Date, default: null },
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    type: {
      type: String,
      enum: ['text', 'link', 'image', 'poll'],
      default: 'text',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    linkUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string | null) {
          if (v === null || v === '') return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid URL format',
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    poll: {
      type: pollSchema,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      validate: [(v: string[]) => v.length <= 10, 'Cannot have more than 10 tags'],
    },
    reactionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ephemeralUntil: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ ephemeralUntil: 1 }, { expireAfterSeconds: 0 });
postSchema.index({ isDeleted: 1, createdAt: -1 });

postSchema.statics.findActive = function () {
  return this.find({
    isDeleted: false,
    $or: [
      { ephemeralUntil: null },
      { ephemeralUntil: { $gt: new Date() } },
    ],
  })
    .populate('author', 'id username avatar')
    .sort({ createdAt: -1 });
};

postSchema.statics.findByAuthor = function (authorId: Types.ObjectId) {
  return this.find({ author: authorId, isDeleted: false })
    .populate('author', 'id username avatar')
    .sort({ createdAt: -1 });
};

export const Post = mongoose.model<IPost, IPostModel>('Post', postSchema);
