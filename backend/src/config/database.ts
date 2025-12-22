import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;

