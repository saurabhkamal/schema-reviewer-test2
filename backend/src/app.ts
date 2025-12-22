import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/health.route';
import authRoutes from './routes/auth.route';
import schemaRoutes from './routes/schema.route';
import impactRoutes from './routes/impact.route';
import recommendationRoutes from './routes/recommendation.route';
import assistantRoutes from './routes/assistant.route';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/schema', schemaRoutes);
app.use('/api/v1/impact', impactRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/assistant', assistantRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;

