import { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';

type LanguageKey = 'typescript' | 'javascript' | 'lua' | 'rust';

const sampleFiles: Array<{ id: string; path: string; language: LanguageKey; content: string }> = [
  {
    id: 'scripts/player.ts',
    path: 'scripts/player.ts',
    language: 'typescript',
    content: `export class PlayerController {
  update(dt: number) {
    // Placeholder for ECS runtime binding.
    console.log('PlayerController tick', dt);
  }
}
`,
  },
  {
    id: 'scripts/logic.js',
    path: 'scripts/logic.js',
    language: 'javascript',
    content: `export function onStart(ctx) {
  ctx.log('Scene started');
}
`,
  },
  {
    id: 'scripts/ai.lua',
    path: 'scripts/ai.lua',
    language: 'lua',
    content: `function onEvent(event, ctx)
  -- Placeholder for Lua runtime.
  if event == 'OnStart' then
    ctx.log('Lua booted');
  end
end
`,
  },
  {
    id: 'scripts/system.rs',
    path: 'scripts/system.rs',
    language: 'rust',
    content: `pub fn update(dt: f32) {
  // Placeholder for native Rust scripting.
  let _ = dt;
}
`,
  },
];

function languageToMonaco(lang: LanguageKey): string {
  switch (lang) {
    case 'typescript':
      return 'typescript';
    case 'javascript':
      return 'javascript';
    case 'lua':
      return 'lua';
    case 'rust':
      return 'rust';
  }
}

export function CodeEditorPanel() {
  const [activeFileId, setActiveFileId] = useState(sampleFiles[0]!.id);
  const activeFile = useMemo(() => sampleFiles.find((f) => f.id === activeFileId)!, [activeFileId]);

  const scene = useAppState((s) => s.scene);

  return (
    <GlassPanel className="h-full p-0 overflow-hidden flex">
      <div className="w-[280px] border-r border-vyb-border/60 bg-black/10 p-2 overflow-auto">
        <div className="text-xs font-bold tracking-wide text-vyb-text/80 mb-2">Script Files</div>
        <div className="space-y-1">
          {sampleFiles.map((f) => {
            const selected = f.id === activeFileId;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFileId(f.id)}
                className={[
                  'w-full text-left rounded-lg border px-2 py-1 text-xs truncate',
                  selected ? 'bg-vyb-accent/20 border-vyb-accent/40' : 'bg-transparent border-vyb-border/40 hover:bg-white/5',
                ].join(' ')}
              >
                {f.path}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg border border-vyb-border/60 bg-black/10 p-2">
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Script metadata</div>
          <div className="text-[11px] text-vyb-text/55">
            Language: {activeFile.language}
            <br />
            Scene binding: {scene ? scene.metadata.name : 'No scene'}
            <br />
            Entry point: {activeFile.path}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-vyb-border/60 bg-vyb-panel/30">
          <div className="text-xs font-bold tracking-wide text-vyb-text/80 truncate">{activeFile.path}</div>
          <div className="text-[11px] text-vyb-text/50">Monaco scaffold</div>
        </div>
        <Editor
          height="100%"
          defaultLanguage={languageToMonaco(activeFile.language)}
          defaultValue={activeFile.content}
          theme="vs-dark"
          options={{
            fontSize: 12,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </GlassPanel>
  );
}

