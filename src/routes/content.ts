import { Router, RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import * as ctrl from '../controllers/contentController';
import { AuthRequest } from '../types';

const router = Router();

router.post('/', auth as RequestHandler, ctrl.create as unknown as RequestHandler );
router.get('/', ctrl.list as unknown as RequestHandler);
router.get('/:id', ctrl.getOne as unknown as RequestHandler);
router.post('/:id/ai/summarize', auth as RequestHandler, ctrl.summarize as unknown as RequestHandler);

export default router;