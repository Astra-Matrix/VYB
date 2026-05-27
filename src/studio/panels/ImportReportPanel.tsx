import ReactMarkdown from 'react-markdown';
import { useAppState } from '../../app/state/useAppState';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { Button } from '../../ui/components/Button';

export function ImportReportPanel() {
  const importReport = useAppState((s) => s.importReport);
  const sourcePath = useAppState((s) => s.importLastSourcePath);
  const setImportReport = useAppState((s) => s.actions.setImportReport);

  if (!importReport) return null;

  return (
    <GlassPanel className="p-2 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Import Report</div>
          <div className="text-[11px] text-vyb-text/55 truncate">{sourcePath}</div>
        </div>
        <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setImportReport(undefined, undefined)}>
          Close
        </Button>
      </div>

      <div className="overflow-auto pr-1">
        <ReactMarkdown>{importReport.markdown}</ReactMarkdown>
      </div>
    </GlassPanel>
  );
}

