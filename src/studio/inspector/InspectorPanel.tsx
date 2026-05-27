import { useMemo } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';
import type { ComponentName } from '../../engine/components';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
      <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">{title}</div>
      {children}
    </div>
  );
}

function CodeLike({ value }: { value: unknown }) {
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-vyb-text/75 leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const COMPONENT_ORDER: ComponentName[] = [
  'transform',
  'camera',
  'light',
  'meshRenderer',
  'material',
  'script',
  'rigidbody',
  'collider',
  'audioSource',
  'uiElement',
  'aiBehavior',
  'networkIdentity',
];

export function InspectorPanel() {
  const scene = useAppState((s) => s.scene);
  const selectedEntityId = useAppState((s) => s.selectedEntityId);

  const selectedEntity = useMemo(() => {
    if (!scene || !selectedEntityId) return undefined;
    return scene.world.getEntity(selectedEntityId);
  }, [scene, selectedEntityId]);

  return (
    <GlassPanel className="p-2 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Inspector</div>
          <div className="text-[11px] text-vyb-text/55">{selectedEntity ? selectedEntity.name : 'No selection'}</div>
        </div>
        <div className="text-[11px] text-vyb-text/40">Typed components (scaffold)</div>
      </div>

      <div className="flex-1 overflow-auto space-y-2 px-1 pr-2">
        {!scene || !selectedEntity ? (
          <div className="text-xs text-vyb-text/55 px-2 py-3">
            Select an entity from the Hierarchy panel to view typed components.
          </div>
        ) : (
          <>
            {COMPONENT_ORDER.map((componentName) => {
              const comp = scene.world.getComponent(selectedEntity.id, componentName);
              if (!comp) return null;
              const title = componentName;
              return (
                <Section key={componentName} title={title}>
                  <CodeLike value={comp} />
                </Section>
              );
            })}
          </>
        )}
      </div>
    </GlassPanel>
  );
}

