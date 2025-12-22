import { randomUUID } from 'crypto';

export const generateSnapshotId = (): string => {
  return randomUUID();
};

export const generateId = (): string => {
  return randomUUID();
};

