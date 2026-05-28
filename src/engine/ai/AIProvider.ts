import type { AICommand } from './aiModels';
import type { AIStudioContext } from './AIContext';

export interface AIProviderResult {
  markdown: string;
  confidence: 'high' | 'medium' | 'low';
  suggestions?: string[];
}

export interface AIProvider {
  readonly id: string;
  readonly displayName: string;
  run(command: AICommand, context: AIStudioContext): Promise<AIProviderResult>;
}
