import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const formatLog = (level: LogLevel, message: string, data?: unknown): string => {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data) {
    entry.data = data;
  }
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, data?: unknown): void => {
    console.log(formatLog('info', message, data));
  },
  warn: (message: string, data?: unknown): void => {
    console.warn(formatLog('warn', message, data));
  },
  error: (message: string, data?: unknown): void => {
    console.error(formatLog('error', message, data));
  },
  debug: (message: string, data?: unknown): void => {
    if (env.nodeEnv === 'development') {
      console.debug(formatLog('debug', message, data));
    }
  },
};

