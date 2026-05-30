import app from './app';
import { env, connectRedis, disconnectRedis, prisma } from './config';

const startServer = async (): Promise<void> => {
  try {
    await connectRedis();

    const server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectRedis();
        await prisma.$disconnect();
        console.log('Server shut down successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
