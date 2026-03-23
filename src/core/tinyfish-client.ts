import {
  AutomationGoal,
  AutomationResult,
  CompleteEvent,
  ProgressEvent,
  EventType,
  RunStatus,
  Logger,
  TinyFishError,
  AsyncRunResponse,
  RunStatusResponse,
} from './types.js';

const API_BASE = process.env.TINYFISH_API_BASE || 'https://agent.tinyfish.ai/v1';
const API_KEY: string = process.env.TINYFISH_API_KEY!;

if (!API_KEY) {
  throw new Error('TINYFISH_API_KEY environment variable is not set');
}

/**
 * STREAMING ENDPOINT - Real-time progress updates
 * Best for: Long-running tasks, complex multi-step workflows, tracking progress
 */
export async function* runAutomationStreaming(
  goal: AutomationGoal
): AsyncGenerator<ProgressEvent | CompleteEvent> {
  Logger.info({ goal }, 'Starting streaming automation');

  const response = await fetch(`${API_BASE}/automation/run-sse`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    throw new TinyFishError(
      `Failed to start automation: ${response.statusText}`,
      'STREAM_INIT_FAILED',
      response.status
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new TinyFishError('No response body', 'NO_BODY', 500);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Normalise CRLF to LF so the split works for both SSE flavours
      const lines = buffer.replace(/\r\n/g, '\n').split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const event = JSON.parse(raw);

            if (event.type === EventType.PROGRESS) {
              Logger.debug(event, 'Progress update');
              yield event as ProgressEvent;
            } else if (event.type === EventType.COMPLETE) {
              Logger.info(event, 'Automation completed');
              yield event as CompleteEvent;
            } else if (event.type === EventType.ERROR) {
              Logger.error(event, 'Automation error');
              yield event as CompleteEvent;
            } else {
              // HEARTBEAT, STARTED, STREAMING_URL — consume silently
              Logger.debug({ type: event.type }, 'SSE lifecycle event');
            }
          } catch (e) {
            Logger.warn({ line }, 'Failed to parse SSE event');
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * SYNCHRONOUS ENDPOINT - Uses streaming but waits for completion
 * Best for: Simple operations, quick extractations, when you need result immediately
 * NOTE: Uses streaming internally for better reliability
 */
export async function runAutomationSync(
  goal: AutomationGoal
): Promise<AutomationResult> {
  Logger.info({ goal }, 'Starting synchronous automation (using streaming backend)');

  const startTime = Date.now();

  try {
    // Use streaming endpoint, collect events until COMPLETE
    let completeEvent: CompleteEvent | null = null;

    for await (const event of runAutomationStreaming(goal)) {
      if (event.type === EventType.COMPLETE) {
        completeEvent = event as CompleteEvent;
        break;
      }
    }

    if (!completeEvent) {
      throw new TinyFishError('No COMPLETE event received from stream', 'NO_COMPLETE_EVENT', 500);
    }

    const result: AutomationResult = {
      status: completeEvent.status,
      result: completeEvent.result,
      execution_time: Date.now() - startTime,
    };

    Logger.info({ result }, 'Synchronous automation completed');
    return result;
  } catch (error) {
    Logger.error({ error }, 'Synchronous automation failed');
    throw error;
  }
}

/**
 * ASYNC ENDPOINT (START) - Initiate long-running task
 * Returns immediately with run_id to poll later
 */
export async function startAutomationAsync(
  goal: AutomationGoal
): Promise<AsyncRunResponse> {
  Logger.info({ goal }, 'Starting async automation');

  const response = await fetch(`${API_BASE}/automation/run-async`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    throw new TinyFishError(
      `Failed to start async automation: ${response.statusText}`,
      'ASYNC_START_FAILED',
      response.status
    );
  }

  const result = (await response.json()) as AsyncRunResponse;
  Logger.info({ run_id: result.run_id }, 'Async automation started');
  return result;
}

/**
 * ASYNC ENDPOINT (POLL) - Check status of async task
 */
export async function getAutomationStatus(runId: string): Promise<RunStatusResponse> {
  Logger.debug({ run_id: runId }, 'Checking async status');

  const response = await fetch(
    `${API_BASE}/automation/run-async/${runId}`,
    {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new TinyFishError(
      `Failed to get status: ${response.statusText}`,
      'STATUS_FAILED',
      response.status
    );
  }

  const status = (await response.json()) as RunStatusResponse;
  Logger.debug({ status }, 'Async status retrieved');
  return status;
}

/**
 * Helper: Poll async task until completion
 * Useful for background jobs
 */
export async function pollUntilComplete(
  runId: string,
  maxWaitMs: number = 60000,
  pollIntervalMs: number = 2000
): Promise<RunStatusResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getAutomationStatus(runId);

    if (status.status === RunStatus.COMPLETED || status.status === RunStatus.FAILED) {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new TinyFishError('Polling timeout exceeded', 'POLL_TIMEOUT', 408);
}
