import type { ScriptingLanguage } from '../project/types';

export interface ScriptLanguageDescriptor {
  language: ScriptingLanguage;
  displayName: string;
  description: string;
  editorHint: 'code' | 'scripting' | 'unknown';
}

export const SCRIPT_LANGUAGES: ScriptLanguageDescriptor[] = [
  { language: 'typescript', displayName: 'TypeScript', description: 'Native TS gameplay runtime (planned).', editorHint: 'code' },
  { language: 'javascript', displayName: 'JavaScript', description: 'JS scripting runtime (planned).', editorHint: 'scripting' },
  { language: 'lua', displayName: 'Lua', description: 'Embedded Lua runtime (planned).', editorHint: 'scripting' },
  { language: 'rust', displayName: 'Rust', description: 'Native Rust scripting integration (planned).', editorHint: 'scripting' },
  { language: 'wasm', displayName: 'WASM', description: 'WASM module scripting runtime (planned).', editorHint: 'scripting' },
];

