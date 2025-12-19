import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type LensRuleType = 'minReactions' | 'author' | 'containsText' | 'hasTag' | 'postType';

export interface ILensRule {
  type: LensRuleType;
  value: string | number;
}

export interface ILens extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  rules: ILensRule[];
  author: Types.ObjectId;
  isPublic: boolean;
  pinned: boolean;
  usageCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ILensModel extends Model<ILens> {
  findPublic(): Promise<ILens[]>;
  findByAuthor(authorId: Types.ObjectId): Promise<ILens[]>;
}

const lensRuleSchema = new Schema<ILensRule>(
  {
    type: {
      type: String,
      required: true,
      enum: ['minReactions', 'author', 'containsText', 'hasTag', 'postType'],
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const lensSchema = new Schema<ILens>(
  {
    name: {
      type: String,
      required: [true, 'Lens name is required'],
      trim: true,
      minlength: [1, 'Lens name cannot be empty'],
      maxlength: [50, 'Lens name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    rules: {
      type: [lensRuleSchema],
      validate: [
        (v: ILensRule[]) => v.length >= 1 && v.length <= 10,
        'Lens must have between 1 and 10 rules',
      ],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    usageCount: {
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

lensSchema.index({ author: 1, createdAt: -1 });
lensSchema.index({ isPublic: 1, usageCount: -1 });
lensSchema.index({ name: 'text' });

lensSchema.statics.findPublic = function () {
  return this.find({ isPublic: true, isDeleted: false })
    .populate('author', 'id username')
    .sort({ usageCount: -1 });
};

lensSchema.statics.findByAuthor = function (authorId: Types.ObjectId) {
  return this.find({ author: authorId, isDeleted: false })
    .populate('author', 'id username')
    .sort({ createdAt: -1 });
};

export const Lens = mongoose.model<ILens, ILensModel>('Lens', lensSchema);
