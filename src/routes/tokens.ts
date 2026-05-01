import { Router, RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import * as ctrl from '../controllers/tokenController';


const router = Router();

router.get('/balance', auth as RequestHandler, ctrl.balance as unknown as RequestHandler);
router.get('/history', auth as RequestHandler, ctrl.history as unknown as RequestHandler);
router.post('/convert', auth as RequestHandler, ctrl.convert as unknown as RequestHandler);
router.post('/withdraw', auth as RequestHandler, ctrl.withdraw as unknown as RequestHandler);
router.post('/add-self',auth as RequestHandler,ctrl.addSelfBalance as unknown as RequestHandler);

export default router;