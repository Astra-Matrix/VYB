import type { ComponentMap, ComponentName } from '../components';
import { VybScene } from './VybScene';
import type { EntityId } from '../ecs';

export interface SerializedSceneEntity {
  id: EntityId;
  name: string;
  parentId?: EntityId;
  components: Partial<Record<ComponentName, ComponentMap[ComponentName]>>;
}

export interface SerializedSceneFile {
  metadata: {
    name: string;
    version: string;
    createdAt: string;
  };
  activeCameraEntityId?: EntityId;
  entities: SerializedSceneEntity[];
}

export function serializeScene(scene: VybScene): SerializedSceneFile {
  const componentNames: ComponentName[] = [
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

  const entities = scene.world.getAllEntities().map((e) => {
    const components: Partial<Record<ComponentName, ComponentMap[ComponentName]>> = {};
    for (const n of componentNames) {
      const c = scene.world.getComponent(e.id, n);
      if (c) components[n] = c;
    }
    return {
      id: e.id,
      name: e.name,
      parentId: e.parentId,
      components,
    };
  });

  return {
    metadata: { ...scene.metadata },
    activeCameraEntityId: scene.activeCameraEntityId,
    entities,
  };
}

export function deserializeScene(data: SerializedSceneFile): VybScene {
  const scene = new VybScene({
    name: data.metadata.name,
    version: data.metadata.version,
    createdAt: data.metadata.createdAt,
  });

  const world = scene.world as unknown as {
    nextId: number;
    entities: Map<EntityId, { id: EntityId; name: string; parentId?: EntityId; children: EntityId[] }>;
    addComponent: <K extends ComponentName>(id: EntityId, n: K, c: ComponentMap[K]) => void;
  };

  let maxId = 0;
  for (const ent of data.entities) {
    const n = Number(ent.id);
    if (!Number.isNaN(n)) maxId = Math.max(maxId, n);
  }
  world.nextId = maxId + 1;

  for (const ent of data.entities) {
    world.entities.set(ent.id, { id: ent.id, name: ent.name, parentId: ent.parentId, children: [] });
    for (const [key, value] of Object.entries(ent.components)) {
      if (value) world.addComponent(ent.id, key as ComponentName, value as ComponentMap[ComponentName]);
    }
  }

  for (const ent of data.entities) {
    if (!ent.parentId) continue;
    const parent = world.entities.get(ent.parentId);
    if (parent && !parent.children.includes(ent.id)) parent.children.push(ent.id);
  }

  scene.activeCameraEntityId = data.activeCameraEntityId;
  return scene;
}

export function sceneToJson(scene: VybScene, pretty = true): string {
  const payload = serializeScene(scene);
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

export function sceneFromJson(json: string): VybScene {
  const data = JSON.parse(json) as SerializedSceneFile;
  if (!data.metadata?.name) throw new Error('Invalid scene file: missing metadata.name');
  if (!Array.isArray(data.entities)) throw new Error('Invalid scene file: missing entities array');
  return deserializeScene(data);
}
