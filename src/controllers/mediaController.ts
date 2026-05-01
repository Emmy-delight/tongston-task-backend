import { Response } from 'express';
import { AuthRequest } from '../types';
import Media from '../models/Media';
import * as cloudinaryService from '../services/cloudinaryService';
import * as s3Service from '../services/s3Service';

export const upload = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const result = await cloudinaryService.uploadBuffer(req.file.buffer, req.file.originalname);

  const media = await Media.create({
    url: result.secure_url,
    publicId: result.public_id,
    storage: 'cloudinary',
    originalName: req.file.originalname,
    uploadedBy: req.user.id,
  });

  res.status(201).json(media);
};

export const promote = async (req: AuthRequest, res: Response): Promise<void> => {
  const media = await Media.findById(req.params.id);

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
  await media.save();

  res.json({ message: 'Successfully promoted to S3', media });
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const media = await Media.find({ uploadedBy: req.user.id })
    .sort({ uploadedAt: -1 })
    .populate('uploadedBy', 'email');

  res.json(media);
};

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
  const media = await Media.findById(req.params.id).populate('uploadedBy', 'email');

  if (!media) {
    res.status(404).json({ error: 'Media not found' });
    return;
  }

  res.json(media);
};