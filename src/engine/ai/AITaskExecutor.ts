import type { AICommand, AITaskHistoryEntry, AITaskStatus } from './aiModels';
import type { AIStudioContext } from './AIContext';
import type { AIProvider } from './AIProvider';
import { LocalAIProvider } from './LocalAIProvider';

export interface AITaskRunResult {
  entry: AITaskHistoryEntry;
}

export class AITaskExecutor {
  constructor(private readonly provider: AIProvider = new LocalAIProvider()) {}

  get providerId(): string {
    return this.provider.id;
  }

  async run(command: AICommand, context: AIStudioContext): Promise<AITaskRunResult> {
    const base: AITaskHistoryEntry = {
      id: `${command.id}-${Date.now()}`,
      command,
      status: 'running' as AITaskStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await this.provider.run(command, context);
      return {
        entry: {
          ...base,
          status: 'succeeded',
          updatedAt: new Date().toISOString(),
          output: result.markdown,
        },
      };
    } catch (e) {
      return {
        entry: {
          ...base,
          status: 'failed',
          updatedAt: new Date().toISOString(),
          error: e instanceof Error ? e.message : String(e),
        },
      };
    }
  }
}

export const defaultAITaskExecutor = new AITaskExecutor();
