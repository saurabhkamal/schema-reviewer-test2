import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, registerSchema } from '../utils/validation';

const router = Router();

router.post('/register', validate(registerSchema), registerController);

router.post('/login', validate(loginSchema), loginController);

export default router;

