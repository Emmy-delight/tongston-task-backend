import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  email: string;
  role: UserRole;
  tokenBalance: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  tokenBalance: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUser>('User', UserSchema);