import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { buildAIContext } from '../../app/ai/buildAIContext';
import { defaultAITaskExecutor } from '../../engine/ai/AITaskExecutor';
import type { AICommand, AICommandType, AITaskHistoryEntry } from '../../engine/ai';
import { useAppState } from '../../app/state/useAppState';
import { StudioPanel } from '../../ui/components/StudioPanel';
import { Button } from '../../ui/components/Button';
import { Badge } from '../../ui/components/Badge';
import { StatusLight } from '../../ui/components/StatusLight';

const TASK_CATALOG: { type: AICommandType; label: string; desc: string }[] = [
  { type: 'explain_import_errors', label: 'Explain import', desc: 'Summarize detection, warnings, and next steps.' },
  { type: 'generate_build_plan', label: 'Build plan', desc: 'Draft deployment steps for the selected target.' },
  { type: 'create_design_doc', label: 'Design doc', desc: 'Outline vision, pillars, and milestones.' },
  { type: 'propose_scene_changes', label: 'Scene ideas', desc: 'ECS and hierarchy suggestions for the open scene.' },
  { type: 'refactor_script', label: 'Script help', desc: 'Scripting conventions and pitfalls.' },
  { type: 'create_shader_notes', label: 'Shader notes', desc: 'WGSL graph and preview guidance.' },
  { type: 'create_ui_layout', label: 'UI layout', desc: 'HUD structure recommendations.' },
  { type: 'create_npc_behavior', label: 'NPC behavior', desc: 'Patrol / alert / combat scaffold.' },
];

export function AIPanel() {
  const projectName = useAppState((s) => s.currentProject?.name);
  const getSnapshot = useAppState.getState;

  const [history, setHistory] = useState<AITaskHistoryEntry[]>([]);
  const [activeOutput, setActiveOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const hasProject = Boolean(projectName);
  const providerLabel = defaultAITaskExecutor.providerId;

  const suggestions = useMemo(
    () =>
      TASK_CATALOG.map((t) => ({
        type: t.type,
        label: t.label,
        desc: t.desc,
      })),
    [],
  );

  async function runTask(type: AICommandType) {
    setRunning(true);
    const command: AICommand = {
      id: `ai-${type}`,
      type,
      createdAt: new Date().toISOString(),
      input: { projectName: projectName ?? undefined },
    };

    const context = buildAIContext(getSnapshot());
    const { entry } = await defaultAITaskExecutor.run(command, context);
    setHistory((h) => [...h, entry]);
    if (entry.output) setActiveOutput(entry.output);
    setRunning(false);
  }

  return (
    <StudioPanel title="AI Assist" icon={<Bot className="w-4 h-4" />} className="h-full" active={running} noPadding>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-vyb-line/50 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="plasma">Local provider</Badge>
            <Badge variant="signal">{providerLabel}</Badge>
            <span className="text-[10px] text-vyb-muted flex items-center gap-1">
              <StatusLight variant={hasProject ? 'green' : 'muted'} />
              {hasProject ? 'Project context loaded' : 'Open a project for richer output'}
            </span>
          </div>
          <p className="text-[11px] text-vyb-muted leading-relaxed">
            Drafts and guidance under your supervision — no external API keys required. Wire a cloud provider in a
            future release.
          </p>
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-2 gap-0">
          <div className="p-3 overflow-auto border-b lg:border-b-0 lg:border-r border-vyb-line/50 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-vyb-text-secondary mb-1">Tasks</div>
            {suggestions.map((s) => (
              <button
                key={s.type}
                type="button"
                disabled={running}
                className="w-full text-left rounded-md border border-vyb-line/60 bg-vyb-charcoal/50 p-2.5 vyb-card-hover disabled:opacity-50"
                onClick={() => void runTask(s.type)}
              >
                <div className="text-xs font-semibold text-vyb-text flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-vyb-magenta" />
                  {s.label}
                </div>
                <div className="text-[10px] text-vyb-muted mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-vyb-line/40">
              <span className="text-[10px] font-bold uppercase tracking-wide text-vyb-muted">Output</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHistory([]);
                  setActiveOutput(null);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-3 prose prose-invert prose-sm max-w-none text-vyb-text-secondary">
              {running ? (
                <div className="flex items-center gap-2 text-vyb-plasma text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running task…
                </div>
              ) : activeOutput ? (
                <ReactMarkdown>{activeOutput}</ReactMarkdown>
              ) : (
                <p className="text-[11px] text-vyb-muted">Select a task to generate a draft.</p>
              )}
            </div>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="shrink-0 max-h-24 overflow-auto border-t border-vyb-line/50 p-2 font-mono text-[10px] text-vyb-muted">
            {history
              .slice(-5)
              .reverse()
              .map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="w-full text-left hover:text-vyb-plasma truncate"
                  onClick={() => h.output && setActiveOutput(h.output)}
                >
                  [{h.status}] {h.command.type}
                </button>
              ))}
          </div>
        ) : null}
      </div>
    </StudioPanel>
  );
}
