import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthPayload {
  id: string;
  role: 'admin' | 'user';
}

export interface AuthRequest extends Request {
  user: AuthPayload;
}

export type TokenType = 'EARN' | 'CONVERT' | 'WITHDRAW';
export type TokenSource = 'AI_USAGE' | 'MANUAL' | 'SYSTEM';
export type MockAsset = 'MOCK_USDT' | 'MOCK_ETH';
export type AIStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT';
export type ConversionStatus = 'PENDING' | 'CONVERTED' | 'WITHDRAWN';
export type UserRole = 'admin' | 'user';

export interface SummarizeBody {
  tone?: string;
  length?: string;
}

export interface ConvertBody {
  toAsset: MockAsset;
  amount: number;
}

export interface WithdrawBody {
  conversionId: string;
}