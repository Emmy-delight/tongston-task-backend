import { Schema, model, Document, Types } from 'mongoose';
import { TokenType, TokenSource } from '../types';

export interface ITokenTransaction extends Document {
  userId: Types.ObjectId;
  type: TokenType;
  source: TokenSource;
  amount: number;
  balanceAfter: number;
  referenceId: string;
  createdAt: Date;
}

const TokenTransactionSchema = new Schema<ITokenTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['EARN', 'CONVERT', 'WITHDRAW'], required: true },
  source: { type: String, enum: ['AI_USAGE', 'MANUAL', 'SYSTEM'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  referenceId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Immutable — no updates allowed
TokenTransactionSchema.pre('save', function (next : any) {
  if (!this.isNew) {
    next(new Error('Token transactions are immutable'));
  } else {
    next();
  }
});

export default model<ITokenTransaction>('TokenTransaction', TokenTransactionSchema);