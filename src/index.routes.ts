import express, { Router } from 'express';
import { incorrectRoute } from './shared/middlewares/incorrectRoute.middleware';
import { catchErrors } from './shared/middlewares/catchErrors.middleware';
import { auth } from './modules/auth/auth.routes';

const router = Router();

router.use(express.json());
router.use('/auth', auth);

router.use('*', incorrectRoute);
router.use(catchErrors);

export { router };
