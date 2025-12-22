import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { UserRole } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const registerUser = async (
  email: string,
  name: string,
  password: string,
  role: UserRole = 'VIEWER'
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info('User logged in', { userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  };
};

