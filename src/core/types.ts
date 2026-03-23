import pino from 'pino';

export enum EventType {
  PROGRESS = 'PROGRESS',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export enum RunStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface AutomationGoal {
  url: string;
  goal: string;
  browser_profile?: 'stealth' | 'lite';
  proxy_config?: {
    enabled: boolean;
    country_code?: 'US' | 'GB' | 'CA' | 'DE' | 'FR' | 'JP' | 'AU';
  };
  max_retries?: number;
}

export interface ProgressEvent {
  type: EventType.PROGRESS;
  purpose: string;
  step?: number;
  total_steps?: number;
}

export interface CompleteEvent {
  type: EventType.COMPLETE | EventType.ERROR;
  status: RunStatus;
  result?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface AutomationResult {
  status: RunStatus;
  result?: Record<string, any>;
  error?: {
    message: string;
  };
  execution_time?: number;
}

export interface AsyncRunResponse {
  run_id: string;
  status: RunStatus;
  created_at: string;
}

export interface RunStatusResponse {
  run_id: string;
  status: RunStatus;
  result?: Record<string, any>;
  error?: {
    message: string;
  };
  progress?: number;
}

export const Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export class TinyFishError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TinyFishError';
  }
}
