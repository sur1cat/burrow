import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
export type ReactionTarget = 'post' | 'comment';

export interface IReaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  targetType: ReactionTarget;
  targetId: Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

interface IReactionModel extends Model<IReaction> {
  findByTarget(targetType: ReactionTarget, targetId: Types.ObjectId): Promise<IReaction[]>;
  findByUser(userId: Types.ObjectId): Promise<IReaction[]>;
  hasUserReacted(userId: Types.ObjectId, targetType: ReactionTarget, targetId: Types.ObjectId): Promise<IReaction | null>;
}

const reactionSchema = new Schema<IReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['post', 'comment'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      refPath: 'targetType',
    },
    type: {
      type: String,
      required: true,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      default: 'like',
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

reactionSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
reactionSchema.index({ targetType: 1, targetId: 1 });
reactionSchema.index({ type: 1 });

reactionSchema.statics.findByTarget = function (
  targetType: ReactionTarget,
  targetId: Types.ObjectId
) {
  return this.find({ targetType, targetId })
    .populate('user', 'id username avatar')
    .sort({ createdAt: -1 });
};

reactionSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

reactionSchema.statics.hasUserReacted = function (
  userId: Types.ObjectId,
  targetType: ReactionTarget,
  targetId: Types.ObjectId
) {
  return this.findOne({ user: userId, targetType, targetId });
};

export const Reaction = mongoose.model<IReaction, IReactionModel>('Reaction', reactionSchema);
