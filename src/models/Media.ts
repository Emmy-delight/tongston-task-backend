import { Schema, model, Document, Types } from 'mongoose';

export type StorageType = 'cloudinary' | 's3';

export interface IMedia extends Document {
  url: string;
  publicId: string;
  storage: StorageType;
  originalName: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  storage: { type: String, enum: ['cloudinary', 's3'], default: 'cloudinary' },
  originalName: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default model<IMedia>('Media', MediaSchema);