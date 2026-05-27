import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { GlassPanel } from '../ui/components/GlassPanel';
import { Button } from '../ui/components/Button';

function normalizeDocId(docId: string | undefined): string | null {
  if (!docId) return null;
  // Accept docId like "01_VISION" or "01_VISION.md".
  return docId.endsWith('.md') ? docId.slice(0, -3) : docId;
}

export function DocsViewer() {
  const params = useParams();
  const docId = normalizeDocId(params.docId);

  const docs = useMemo(() => {
    // Import all markdown docs from the repo root /docs.
    // Vite will include them in the dev bundle.
    const modules = import.meta.glob('../../docs/**/*.md', {
      eager: true,
      query: '?raw',
    }) as Record<string, string>;
    return modules;
  }, []);

  const markdown = useMemo(() => {
    if (!docId) return null;
    const key = Object.keys(docs).find((k) => k.toLowerCase().endsWith(`/${docId}.md`.toLowerCase()) || k.toLowerCase().endsWith(`/${docId}.md`));
    if (!key) return null;
    return docs[key];
  }, [docId, docs]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-vyb-bg p-3">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold tracking-wide text-vyb-text">VYB Documentation</div>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        <GlassPanel className="flex-1 overflow-auto p-4">
          {markdown ? (
            <ReactMarkdown>{markdown}</ReactMarkdown>
          ) : (
            <div className="text-sm text-vyb-text/60">
              Doc not found. Expected <span className="font-mono">{docId}</span>.
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

