import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import TokenTransaction from '../models/TokenTransaction';
import ContractConversion from '../models/ContractConversion';
import { AuthRequest, ConvertBody, WithdrawBody, MockAsset } from '../types';

const EXCHANGE_RATES: Record<MockAsset, number> = {
  MOCK_USDT: 100,   // 100 tokens → 1 MOCK_USDT
  MOCK_ETH: 20000,  // 20000 tokens → 1 MOCK_ETH
};

export const balance = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user.id).select('email tokenBalance role');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ email: user.email, tokenBalance: user.tokenBalance, role: user.role });
};

export const history = async (req: AuthRequest, res: Response): Promise<void> => {
  const transactions = await TokenTransaction
    .find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(transactions);
};

export const convert = async (req: AuthRequest, res: Response): Promise<void> => {
  const { toAsset, amount } = req.body as ConvertBody;

  if (!['MOCK_USDT', 'MOCK_ETH'].includes(toAsset)) {
    res.status(400).json({ error: 'Invalid asset. Use MOCK_USDT or MOCK_ETH' });
    return;
  }

  if (!amount || amount <= 0 || !Number.isInteger(amount)) {
    res.status(400).json({ error: 'Amount must be a positive integer' });
    return;
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.tokenBalance < amount) {
    res.status(400).json({
      error: 'Insufficient token balance',
      required: amount,
      available: user.tokenBalance,
    });
    return;
  }

  const rate = EXCHANGE_RATES[toAsset];
  const convertedAmount = amount / rate;
  const txHashMock = `0x${uuidv4().replace(/-/g, '')}`;

  // Deduct tokens atomically
  user.tokenBalance -= amount;
  await user.save();

  const conversion = await ContractConversion.create({
    userId: user._id,
    fromToken: amount,
    toAsset,
    amount: convertedAmount,
    exchangeRate: rate,
    txHashMock,
    status: 'CONVERTED',
  });

  await TokenTransaction.create({
    userId: user._id,
    type: 'CONVERT',
    source: 'SYSTEM',
    amount: -amount,
    balanceAfter: user.tokenBalance,
    referenceId: conversion._id.toString(),
  });

  res.json({
    txHashMock,
    convertedAmount: `${convertedAmount.toFixed(6)} ${toAsset}`,
    newTokenBalance: user.tokenBalance,
    conversionId: conversion._id,
  });
};

export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  const { conversionId } = req.body as WithdrawBody;

  if (!conversionId) {
    res.status(400).json({ error: 'conversionId is required' });
    return;
  }

  const conversion = await ContractConversion.findById(conversionId);

  if (!conversion) {
    res.status(404).json({ error: 'Conversion record not found' });
    return;
  }

  if (conversion.userId.toString() !== req.user.id) {
    res.status(403).json({ error: 'Forbidden: not your conversion' });
    return;
  }

  if (conversion.status === 'WITHDRAWN') {
    res.status(400).json({ error: 'Already withdrawn' });
    return;
  }

  conversion.status = 'WITHDRAWN';
  await conversion.save();

  const txHashMock = `0xwithdraw${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  await TokenTransaction.create({
    userId: req.user.id,
    type: 'WITHDRAW',
    source: 'SYSTEM',
    amount: 0,
    balanceAfter: (await User.findById(req.user.id))?.tokenBalance ?? 0,
    referenceId: conversion._id.toString(),
  });

  res.json({
    status: 'SUCCESS',
    network: 'Ethereum',
    txHashMock,
    asset: conversion.toAsset,
    amount: conversion.amount,
  });
};

// Add balance to the currently logged-in user (useful for testing)
export const addSelfBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount } = req.body as { amount: number };
   console.log("Reaching here")
  if (!amount || amount <= 0 || !Number.isInteger(amount)) {
    res.status(400).json({ error: 'amount must be a positive integer' });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { tokenBalance: amount } },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await TokenTransaction.create({
    userId: user._id,
    type: 'EARN',
    source: 'MANUAL',
    amount,
    balanceAfter: user.tokenBalance,
    referenceId: 'self-top-up',
  });

  res.json({
    message: 'Balance added successfully',
    amountAdded: amount,
    newTokenBalance: user.tokenBalance,
  });
};