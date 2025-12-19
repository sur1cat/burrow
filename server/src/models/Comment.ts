import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  parentComment: Types.ObjectId | null;
  depth: number;
  reactionsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ICommentModel extends Model<IComment> {
  findByPost(postId: Types.ObjectId): Promise<IComment[]>;
  findReplies(commentId: Types.ObjectId): Promise<IComment[]>;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
      max: [10, 'Maximum nesting depth is 10'],
    },
    reactionsCount: {
      type: Number,
      default: 0,
      min: 0,
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

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1, createdAt: -1 });

commentSchema.statics.findByPost = function (postId: Types.ObjectId) {
  return this.find({ post: postId, isDeleted: false })
    .populate('author', 'id username avatar')
    .sort({ createdAt: 1 });
};

commentSchema.statics.findReplies = function (commentId: Types.ObjectId) {
  return this.find({ parentComment: commentId, isDeleted: false })
    .populate('author', 'id username avatar')
    .sort({ createdAt: 1 });
};

export const Comment = mongoose.model<IComment, ICommentModel>('Comment', commentSchema);
