import { Schema, model, Document, Types } from 'mongoose';
import { AIStatus } from '../types';

export interface IAIRun extends Document {
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  promptVersion: string;
  status: AIStatus;
  output: string;
  latencyMs: number;
  tokensAwarded: number;
  createdAt: Date;
}

const AIRunSchema = new Schema<IAIRun>({
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  promptVersion: { type: String, default: 'v1.0' },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'TIMEOUT'], required: true },
  output: { type: String, default: '' },
  latencyMs: { type: Number, required: true },
  tokensAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default model<IAIRun>('AIRun', AIRunSchema);