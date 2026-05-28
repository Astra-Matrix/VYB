import type { ScriptingLanguage } from '../project/types';

export interface ScriptLanguageDescriptor {
  language: ScriptingLanguage;
  displayName: string;
  description: string;
  editorHint: 'code' | 'scripting' | 'unknown';
}

export const SCRIPT_LANGUAGES: ScriptLanguageDescriptor[] = [
  { language: 'typescript', displayName: 'TypeScript', description: 'Editor gameplay scripts via TS→JS bridge.', editorHint: 'code' },
  { language: 'javascript', displayName: 'JavaScript', description: 'JavaScript gameplay scripts (onStart/onUpdate).', editorHint: 'scripting' },
  { language: 'lua', displayName: 'Lua', description: 'Lua bridge stub (Phase 3+).', editorHint: 'scripting' },
  { language: 'rust', displayName: 'Rust', description: 'Rust bridge stub (future native integration).', editorHint: 'scripting' },
  { language: 'wasm', displayName: 'WASM', description: 'WASM bridge stub (future sandbox modules).', editorHint: 'scripting' },
];

