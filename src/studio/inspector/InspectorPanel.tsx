import { useMemo, useState, useEffect } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { TextField } from '../../ui/components/TextField';
import { useAppState } from '../../app/state/useAppState';
import type { ComponentName } from '../../engine/components';
import type { TransformComponent } from '../../engine/components';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-vyb-border/60 bg-black/10 p-2">
      <div className="text-[11px] font-bold tracking-wide text-vyb-text/70 mb-2">{title}</div>
      {children}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="w-8 text-vyb-text/50">{label}</span>
      <input
        type="number"
        step="0.1"
        className="flex-1 rounded border border-vyb-border/50 bg-black/20 px-2 py-1 text-vyb-text"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TransformEditor({
  transform,
  onChange,
}: {
  transform: TransformComponent;
  onChange: (t: TransformComponent) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] text-vyb-text/45 uppercase tracking-wide">Position</div>
      <NumField label="X" value={transform.position.x} onChange={(x) => onChange({ ...transform, position: { ...transform.position, x } })} />
      <NumField label="Y" value={transform.position.y} onChange={(y) => onChange({ ...transform, position: { ...transform.position, y } })} />
      <NumField label="Z" value={transform.position.z} onChange={(z) => onChange({ ...transform, position: { ...transform.position, z } })} />
      <div className="text-[10px] text-vyb-text/45 uppercase tracking-wide pt-1">Scale</div>
      <NumField label="X" value={transform.scale.x} onChange={(x) => onChange({ ...transform, scale: { ...transform.scale, x } })} />
      <NumField label="Y" value={transform.scale.y} onChange={(y) => onChange({ ...transform, scale: { ...transform.scale, y } })} />
      <NumField label="Z" value={transform.scale.z} onChange={(z) => onChange({ ...transform, scale: { ...transform.scale, z } })} />
    </div>
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
  const renameSelectedEntity = useAppState((s) => s.actions.renameSelectedEntity);
  const updateSelectedTransform = useAppState((s) => s.actions.updateSelectedTransform);

  const selectedEntity = useMemo(() => {
    if (!scene || !selectedEntityId) return undefined;
    return scene.world.getEntity(selectedEntityId);
  }, [scene, selectedEntityId]);

  const transform = useMemo(() => {
    if (!scene || !selectedEntityId) return undefined;
    return scene.world.getTransform(selectedEntityId);
  }, [scene, selectedEntityId]);

  const [entityName, setEntityName] = useState('');

  useEffect(() => {
    setEntityName(selectedEntity?.name ?? '');
  }, [selectedEntity?.name, selectedEntityId]);

  return (
    <GlassPanel className="p-2 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-1 mb-2">
        <div>
          <div className="text-xs font-bold tracking-wide text-vyb-text/80">Inspector</div>
          <div className="text-[11px] text-vyb-text/55">{selectedEntity ? selectedEntity.name : 'No selection'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-2 px-1 pr-2">
        {!scene || !selectedEntity ? (
          <div className="text-xs text-vyb-text/55 px-2 py-3">Select an entity from the Hierarchy panel.</div>
        ) : (
          <>
            <Section title="Entity">
              <TextField
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                onBlur={() => renameSelectedEntity(entityName)}
              />
              <div className="text-[10px] text-vyb-text/40 mt-1 font-mono">id: {selectedEntity.id}</div>
            </Section>

            {transform ? (
              <Section title="transform">
                <TransformEditor
                  transform={transform}
                  onChange={(t) => updateSelectedTransform(t)}
                />
              </Section>
            ) : null}

            {COMPONENT_ORDER.filter((c) => c !== 'transform').map((componentName) => {
              const comp = scene.world.getComponent(selectedEntity.id, componentName);
              if (!comp) return null;
              return (
                <Section key={componentName} title={componentName}>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-vyb-text/75 leading-relaxed">
                    {JSON.stringify(comp, null, 2)}
                  </pre>
                </Section>
              );
            })}
          </>
        )}
      </div>
    </GlassPanel>
  );
}
