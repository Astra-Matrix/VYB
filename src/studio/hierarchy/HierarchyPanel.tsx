import { useMemo } from 'react';
import { GlassPanel } from '../../ui/components/GlassPanel';
import { useAppState } from '../../app/state/useAppState';
import type { EntityId } from '../../engine/ecs/EcsWorld';

function HierarchyRow({
  entityId,
  depth,
  selectedId,
  name,
  onSelect,
}: {
  entityId: EntityId;
  depth: number;
  selectedId?: EntityId;
  name: string;
  onSelect: (id: EntityId) => void;
}) {
  const selected = entityId === selectedId;
  return (
    <button
      className={[
        'w-full text-left px-2 py-1 rounded-lg text-xs',
        selected ? 'bg-vyb-accent/20 border border-vyb-accent/40' : 'bg-transparent hover:bg-white/5',
      ].join(' ')}
      onClick={() => onSelect(entityId)}
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-vyb-text/90 truncate">{name}</span>
      </div>
    </button>
  );
}

export function HierarchyPanel() {
  const scene = useAppState((s) => s.scene);
  const selectedEntityId = useAppState((s) => s.selectedEntityId);
  const selectEntity = useAppState((s) => s.actions.selectEntity);

  const roots = useMemo(() => {
    if (!scene) return [] as EntityId[];
    return scene.world.getAllEntities().filter((e) => !e.parentId).map((e) => e.id);
  }, [scene]);

  const renderNode = (id: EntityId, depth: number): JSX.Element[] => {
    if (!scene) return [];
    const ent = scene.world.getEntity(id);
    if (!ent) return [];
    const children = scene.world.getChildren(id);
    return [
      <HierarchyRow
        key={id}
        entityId={id}
        depth={depth}
        selectedId={selectedEntityId}
        name={ent.name}
        onSelect={(nextId) => selectEntity(nextId)}
      />,
      ...children.flatMap((childId) => renderNode(childId, depth + 1)),
    ];
  };

  return (
    <GlassPanel className="p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-xs font-bold tracking-wide text-vyb-text/80">Hierarchy</div>
        <button className="text-xs text-vyb-text/50 hover:text-vyb-text/80">+ Add</button>
      </div>

      <div className="space-y-1">
        {scene ? (
          roots.length > 0 ? (
            roots.flatMap((r) => renderNode(r, 0))
          ) : (
            <div className="text-xs text-vyb-text/50 px-2 py-3">No entities in scene.</div>
          )
        ) : (
          <div className="text-xs text-vyb-text/50 px-2 py-3">Load a scene to inspect entities.</div>
        )}
      </div>
    </GlassPanel>
  );
}

