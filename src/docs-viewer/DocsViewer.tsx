import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { GlassPanel } from '../ui/components/GlassPanel';
import { Button } from '../ui/components/Button';
import { useAppState } from '../app/state/useAppState';

const DOC_MODULES = import.meta.glob('../../docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function normalizeDocId(docId: string | undefined): string | null {
  if (!docId) return null;
  return docId.endsWith('.md') ? docId.slice(0, -3) : docId;
}

function loadDocMarkdown(docId: string): string | null {
  const key = Object.keys(DOC_MODULES).find((k) =>
    k.replace(/\\/g, '/').toLowerCase().endsWith(`/docs/${docId.toLowerCase()}.md`),
  );
  if (!key) return null;
  return DOC_MODULES[key] ?? null;
}

export function DocsViewer() {
  const params = useParams();
  const navigate = useNavigate();
  const hasProject = useAppState((s) => !!s.currentProject);
  const docId = normalizeDocId(params.docId);

  const markdown = useMemo(() => (docId ? loadDocMarkdown(docId) : null), [docId]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-vyb-bg p-3">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold tracking-wide text-vyb-text">VYB Documentation</div>
          <Button
            variant="ghost"
            onClick={() => {
              if (hasProject) navigate('/studio');
              else navigate('/');
            }}
          >
            {hasProject ? 'Back to studio' : 'Back to launcher'}
          </Button>
        </div>

        <GlassPanel className="flex-1 overflow-auto p-4 prose prose-invert prose-sm max-w-none">
          {markdown ? (
            <ReactMarkdown>{markdown}</ReactMarkdown>
          ) : (
            <div className="text-sm text-vyb-muted">
              Doc not found. Expected <span className="font-mono text-vyb-plasma">{docId}</span>.
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
