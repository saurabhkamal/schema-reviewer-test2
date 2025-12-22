import { Response } from 'express';
import { loginSchema, registerSchema } from '../utils/validation';
import { registerUser, loginUser } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerController = async (req: AuthRequest, res: Response): Promise<void> => {
  const validated = registerSchema.parse(req.body);
  const user = await registerUser(
    validated.email,
    validated.name,
    validated.password,
    validated.role
  );

  res.status(201).json({
    status: 'success',
    data: { user },
  });
};

export const loginController = async (req: AuthRequest, res: Response): Promise<void> => {
  const validated = loginSchema.parse(req.body);
  const result = await loginUser(validated.email, validated.password);

  res.json({
    status: 'success',
    data: result,
  });
};

