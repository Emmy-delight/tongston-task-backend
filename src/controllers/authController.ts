import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserRole } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, role } = req.body as { email: string; role?: UserRole };

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = await User.findOneAndUpdate(
    { email },
    { email, role: role ?? 'user' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user._id, email: user.email, role: user.role, tokenBalance: user.tokenBalance } });
};