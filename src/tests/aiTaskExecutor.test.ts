import { describe, expect, it } from 'vitest';
import { AITaskExecutor } from '../engine/ai/AITaskExecutor';
import type { AIProvider } from '../engine/ai/AIProvider';
import type { AIStudioContext } from '../engine/ai/AIContext';

describe('AITaskExecutor', () => {
  it('runs explain_import via local provider', async () => {
    const executor = new AITaskExecutor();
    const result = await executor.run(
      {
        id: 't1',
        type: 'explain_import_errors',
        createdAt: new Date().toISOString(),
        input: {},
      },
      {
        importReport: {
          markdown: '# Import\n\nDetected godot.',
          summary: { detectedType: 'godot', importableNow: 2, requiresManual: 1, planned: 3, unsupported: 0 },
          warnings: [{ severity: 'warning', code: 'W1', message: 'Manual mesh cleanup' }],
        },
      },
    );
    expect(result.entry.status).toBe('succeeded');
    expect(result.entry.output).toContain('Import');
  });

  it('uses injectable provider', async () => {
    const mock: AIProvider = {
      id: 'mock',
      displayName: 'Mock',
      run: async () => ({ markdown: 'mock output', confidence: 'high' }),
    };
    const executor = new AITaskExecutor(mock);
    const result = await executor.run(
      {
        id: 't2',
        type: 'generate_build_plan',
        createdAt: new Date().toISOString(),
        input: {},
      },
      {} as AIStudioContext,
    );
    expect(result.entry.output).toBe('mock output');
  });
});
