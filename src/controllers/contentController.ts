import { Response } from 'express';
import Content from '../models/Content';
import AIRun from '../models/AIRun';
import User from '../models/User';
import TokenTransaction from '../models/TokenTransaction';
import * as aiService from '../services/aiService';
import { AuthRequest, SummarizeBody, AIStatus } from '../types';

const TOKENS_PER_RUN = 5;

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, tags } = req.body as { title: string; body: string; tags?: string[] };

  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const content = await Content.create({
    title,
    body,
    tags: tags ?? [],
    createdBy: req.user.id,
  });

  res.status(201).json(content);
};

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  const { tag, q, page = '1' } = req.query as { tag?: string; q?: string; page?: string };

  const filter: Record<string, unknown> = {};
  if (tag) filter.tags = tag;
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(1, parseInt(page, 10));

  const [items, total] = await Promise.all([
    Content.find(filter)
      .skip((pageNum - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email'),
    Content.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / 10) });
};

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
  const content = await Content.findById(req.params.id).populate('createdBy', 'email');
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  res.json(content);
};

export const summarize = async (req: AuthRequest, res: Response): Promise<void> => {
  const content = await Content.findById(req.params.id);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }

  const { tone = 'neutral', length = 'short' } = req.body as SummarizeBody;
  const start = Date.now();

  let output: string;
  let status: AIStatus;

  try {
    output = await aiService.summarize(content.body, { tone, length });
    status = 'SUCCESS';
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'UNKNOWN';
    status = errorMessage === 'TIMEOUT' ? 'TIMEOUT' : 'FAILED';
    output = `AI service unavailable. Fallback preview: ${content.body.slice(0, 120)}...`;
  }

  const latencyMs = Date.now() - start;
  const tokensAwarded = status === 'SUCCESS' ? TOKENS_PER_RUN : 0;

  const aiRun = await AIRun.create({
    contentId: content._id,
    userId: req.user.id,
    promptVersion: 'v1.0',
    status,
    output,
    latencyMs,
    tokensAwarded,
  });

  let totalTokenBalance = 0;

  if (status === 'SUCCESS') {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { tokenBalance: TOKENS_PER_RUN } },
      { new: true }
    );

    totalTokenBalance = updatedUser?.tokenBalance ?? 0;

    await TokenTransaction.create({
      userId: req.user.id,
      type: 'EARN',
      source: 'AI_USAGE',
      amount: TOKENS_PER_RUN,
      balanceAfter: totalTokenBalance,
      referenceId: aiRun._id.toString(),
    });
  }

  res.json({ output, latencyMs, tokensAwarded, totalTokenBalance });
};