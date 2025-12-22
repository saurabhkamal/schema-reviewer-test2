import { Response } from 'express';
import { generateSqlRecommendations, getRecommendationsForIssue, getRecommendationsForSnapshot } from '../services/recommendation.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const generateRecommendationsController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { issueId } = req.params;

  if (!issueId) {
    throw new AppError('Issue ID is required', 400);
  }

  const recommendations = await generateSqlRecommendations(issueId);

  res.json({
    status: 'success',
    data: recommendations,
  });
};

export const getIssueRecommendationsController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { issueId } = req.params;

  if (!issueId) {
    throw new AppError('Issue ID is required', 400);
  }

  const recommendations = await getRecommendationsForIssue(issueId);

  res.json({
    status: 'success',
    data: recommendations,
  });
};

export const getSnapshotRecommendationsController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { snapshotId } = req.params;

  if (!snapshotId) {
    throw new AppError('Snapshot ID is required', 400);
  }

  const recommendations = await getRecommendationsForSnapshot(snapshotId);

  res.json({
    status: 'success',
    data: recommendations,
  });
};

