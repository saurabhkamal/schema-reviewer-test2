import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const startServer = async () => {
  try {
    await connectDatabase();
    
    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('Process terminated');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

