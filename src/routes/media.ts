import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import * as ctrl from '../controllers/mediaController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', auth as RequestHandler, upload.single('file'), ctrl.upload as unknown as RequestHandler);
router.post('/:id/promote', auth as RequestHandler, ctrl.promote as unknown as RequestHandler);

export default router;