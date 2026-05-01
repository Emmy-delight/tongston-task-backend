import { Schema, model, Document, Types } from 'mongoose';

export interface IContent extends Document {
  title: string;
  body: string;
  tags: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const ContentSchema = new Schema<IContent>({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for filtering & full-text search
ContentSchema.index({ tags: 1 });
ContentSchema.index({ title: 'text', body: 'text' });

export default model<IContent>('Content', ContentSchema);