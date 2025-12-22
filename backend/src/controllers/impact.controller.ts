import { Response } from 'express';
import { getImpactScore, getRankedIssues } from '../services/scoring.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getImpactScoreController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { snapshotId } = req.params;

  if (!snapshotId) {
    throw new AppError('Snapshot ID is required', 400);
  }

  const score = await getImpactScore(snapshotId);

  res.json({
    status: 'success',
    data: score,
  });
};

export const getRankedIssuesController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { snapshotId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!snapshotId) {
    throw new AppError('Snapshot ID is required', 400);
  }

  const issues = await getRankedIssues(snapshotId, limit);

  res.json({
    status: 'success',
    data: issues.map((issue) => ({
      id: issue.id,
      severity: issue.severity,
      category: issue.category,
      title: issue.title,
      description: issue.description,
      recommendation: issue.recommendation,
      tableName: issue.table?.name,
      createdAt: issue.createdAt,
    })),
  });
};

