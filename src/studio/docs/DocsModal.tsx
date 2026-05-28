import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';
import { IconButton } from '../../ui/components/IconButton';

const DOC_MODULES = import.meta.glob('../../../docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const DOC_LINKS: { id: string; label: string }[] = [
  { id: '01_VISION', label: 'Vision' },
  { id: '02_ARCHITECTURE', label: 'Architecture' },
  { id: '11_BUILD_SYSTEM', label: 'Build system' },
  { id: '10_AI_ASSISTED_WORKFLOWS', label: 'AI workflows' },
  { id: '15_ROADMAP', label: 'Roadmap' },
];

function loadDocMarkdown(docId: string): string | null {
  const key = Object.keys(DOC_MODULES).find((k) =>
    k.replace(/\\/g, '/').toLowerCase().endsWith(`/docs/${docId.toLowerCase()}.md`),
  );
  if (!key) return null;
  return DOC_MODULES[key] ?? null;
}

export function DocsModal({ docId, onClose, onSelectDoc }: { docId: string; onClose: () => void; onSelectDoc: (id: string) => void }) {
  const markdown = useMemo(() => loadDocMarkdown(docId), [docId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <GlassPanel className="w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-3 border-b border-vyb-line/50">
          <div>
            <div className="text-sm font-bold text-vyb-text">Documentation</div>
            <div className="text-[11px] text-vyb-muted font-mono">{docId}</div>
          </div>
          <IconButton aria-label="Close documentation" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="flex gap-2 px-3 py-2 border-b border-vyb-line/40 overflow-x-auto">
          {DOC_LINKS.map((d) => (
            <Button
              key={d.id}
              variant={d.id === docId ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onSelectDoc(d.id)}
            >
              {d.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 prose prose-invert prose-sm max-w-none text-vyb-text-secondary">
          {markdown ? (
            <ReactMarkdown>{markdown}</ReactMarkdown>
          ) : (
            <p className="text-vyb-muted">
              Document <span className="font-mono text-vyb-plasma">{docId}</span> was not found in the bundled docs folder.
            </p>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
