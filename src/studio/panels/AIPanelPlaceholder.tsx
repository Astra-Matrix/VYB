import { useMemo, useState } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { useAppState } from '../../app/state/useAppState';
import type { AICommand, AITaskHistoryEntry } from '../../engine/ai';

export function AIPanelPlaceholder() {
  const importReport = useAppState((s) => s.importReport);
  const projectName = useAppState((s) => s.currentProject?.name);

  const [history, setHistory] = useState<AITaskHistoryEntry[]>([]);

  const suggestions = useMemo<AICommand[]>(
    () => [
      {
        id: 'ai-suggest-build-plan',
        type: 'generate_build_plan',
        createdAt: new Date().toISOString(),
        input: { projectName },
      },
      {
        id: 'ai-suggest-import-explain',
        type: 'explain_import_errors',
        createdAt: new Date().toISOString(),
        input: { projectName, importReportMarkdown: importReport?.markdown },
      },
      {
        id: 'ai-suggest-ui-layout',
        type: 'create_ui_layout',
        createdAt: new Date().toISOString(),
        input: { projectName },
      },
    ],
    [importReport?.markdown, projectName],
  );

  return (
    <GlassPanel className="p-2 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">AI Assist</div>
          <div className="text-[11px] text-vyb-text/55">Architecture scaffold — no provider wired.</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-1 space-y-2">
        <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Suggestion card</div>
          <div className="text-[11px] text-vyb-text/60 leading-relaxed">
            Generate a migration plan for detected project assets. This scaffold can surface “what can be imported now”
            and “what requires manual migration” once the import pipeline is implemented.
          </div>
          <div className="mt-2">
            <Button variant="secondary" className="w-full" onClick={() => {}}>
              Run AI task (placeholder)
            </Button>
          </div>
        </div>

        {importReport ? (
          <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
            <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Context awareness (scaffold)</div>
            <div className="text-[11px] text-vyb-text/60 leading-relaxed">
              Current import report includes detection + plan. When AI providers are integrated, this will become the
              context for explanations, refactoring guidance, and build plans.
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-1">Planned capabilities</div>
          <ul className="text-[11px] text-vyb-text/60 list-disc pl-5 space-y-1">
            <li>Design document creation</li>
            <li>Scene generation + validation</li>
            <li>Error explanation + refactoring</li>
            <li>Shader and UI layout helpers</li>
            <li>Quest / NPC behavior creation</li>
          </ul>
        </div>

        <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
          <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">AI task suggestions (scaffold)</div>
          <div className="space-y-2">
            {suggestions.map((cmd) => (
              <div key={cmd.id} className="rounded-lg border border-vyb-border/40 bg-black/10 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-vyb-text/85">{cmd.type}</div>
                  <div className="text-[11px] text-vyb-text/45">{projectName ? 'context-ready' : 'no project'}</div>
                </div>
                <div className="text-[11px] text-vyb-text/55 mt-1">
                  No provider is wired yet. Clicking this button validates task UX and history plumbing.
                </div>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      const entry: AITaskHistoryEntry = {
                        id: `${cmd.id}-${Date.now()}`,
                        command: cmd,
                        status: 'queued',
                        updatedAt: new Date().toISOString(),
                      };
                      setHistory((h) => [...h, entry]);
                      setHistory((h) =>
                        h.map((e) =>
                          e.id === entry.id
                            ? {
                                ...e,
                                status: 'succeeded',
                                updatedAt: new Date().toISOString(),
                                output: 'Scaffold output: integrate an AI provider in a later phase.',
                              }
                            : e,
                        ),
                      );
                    }}
                  >
                    Run (scaffold)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {history.length > 0 ? (
          <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
            <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">Task history (local)</div>
            <div className="space-y-2">
              {history
                .slice(-10)
                .reverse()
                .map((h) => (
                  <div key={h.id} className="text-[11px] text-vyb-text/65">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono">{h.command.type}</span>
                      <span>{h.status}</span>
                    </div>
                    {h.output ? <div className="mt-1 text-vyb-text/50">{h.output}</div> : null}
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}

