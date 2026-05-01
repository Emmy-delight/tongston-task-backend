import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../types';
import * as cloudinaryService from '../services/cloudinaryService';
import * as s3Service from '../services/s3Service';

interface MediaRecord {
  id: string;
  url: string;
  publicId: string;
  storage: 'cloudinary' | 's3';
  originalName: string;
  uploadedAt: Date;
}

// In-memory store — replace with a Media mongoose model in production
const mediaStore = new Map<string, MediaRecord>();

export const upload = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const result = await cloudinaryService.uploadBuffer(req.file.buffer, req.file.originalname);
  const id = new Types.ObjectId().toString();

  const record: MediaRecord = {
    id,
    url: result.secure_url,
    publicId: result.public_id,
    storage: 'cloudinary',
    originalName: req.file.originalname,
    uploadedAt: new Date(),
  };

  mediaStore.set(id, record);
  res.status(201).json(record);
};

export const promote = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const media = mediaStore.get(id);

  if (!media) {
    res.status(404).json({ error: 'Media not found' });
    return;
  }

  if (media.storage === 's3') {
    res.status(400).json({ error: 'Already promoted to S3' });
    return;
  }

  const s3Url = await s3Service.uploadFromUrl(media.url, media.publicId);

  media.url = s3Url;
  media.storage = 's3';
  mediaStore.set(id, media);

  res.json({ message: 'Successfully promoted to S3', media });
};