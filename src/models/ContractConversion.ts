import { Schema, model, Document, Types } from 'mongoose';
import { MockAsset, ConversionStatus } from '../types';

export interface IContractConversion extends Document {
  userId: Types.ObjectId;
  fromToken: number;
  toAsset: MockAsset;
  amount: number;
  exchangeRate: number;
  txHashMock: string;
  status: ConversionStatus;
  createdAt: Date;
}

const ContractConversionSchema = new Schema<IContractConversion>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fromToken: { type: Number, required: true },
  toAsset: { type: String, enum: ['MOCK_USDT', 'MOCK_ETH'], required: true },
  amount: { type: Number, required: true },
  exchangeRate: { type: Number, required: true },
  txHashMock: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'CONVERTED', 'WITHDRAWN'], default: 'CONVERTED' },
  createdAt: { type: Date, default: Date.now },
});

export default model<IContractConversion>('ContractConversion', ContractConversionSchema);