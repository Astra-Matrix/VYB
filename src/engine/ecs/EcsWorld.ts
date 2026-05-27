import type { ComponentMap, ComponentName } from '../components';
import type { TransformComponent } from '../components/components';

export type EntityId = string;

export interface EntityRecord {
  id: EntityId;
  name: string;
  parentId?: EntityId;
  children: EntityId[];
}

export interface EcsSnapshot {
  entities: EntityRecord[];
  selectedEntityId?: EntityId;
}

/**
 * EcsWorld
 * Editor-side ECS storage for typed component access.
 *
 * Note: This is the editor representation. Runtime systems (physics/render/audio)
 * will come in later phases.
 */
export class EcsWorld {
  private nextId = 1;
  private entities = new Map<EntityId, EntityRecord>();

  private components: { [K in ComponentName]: Map<EntityId, ComponentMap[K]> } = {
    transform: new Map(),
    camera: new Map(),
    light: new Map(),
    meshRenderer: new Map(),
    material: new Map(),
    script: new Map(),
    rigidbody: new Map(),
    collider: new Map(),
    audioSource: new Map(),
    uiElement: new Map(),
    aiBehavior: new Map(),
    networkIdentity: new Map(),
  };

  createEntity(name: string, parentId?: EntityId): EntityId {
    const id = String(this.nextId++);
    const rec: EntityRecord = { id, name, parentId, children: [] };
    this.entities.set(id, rec);
    if (parentId) this.setParent(parentId, id);
    return id;
  }

  getEntity(entityId: EntityId): EntityRecord | undefined {
    return this.entities.get(entityId);
  }

  getAllEntities(): EntityRecord[] {
    return Array.from(this.entities.values());
  }

  getChildren(parentId: EntityId): EntityId[] {
    return this.entities.get(parentId)?.children ?? [];
  }

  setParent(parentId: EntityId, childId: EntityId): void {
    const parent = this.entities.get(parentId);
    const child = this.entities.get(childId);
    if (!parent || !child) return;

    // Remove from previous parent.
    if (child.parentId && child.parentId !== parentId) {
      const prevParent = this.entities.get(child.parentId);
      prevParent?.children.splice(prevParent.children.indexOf(childId), 1);
    }

    child.parentId = parentId;
    if (!parent.children.includes(childId)) parent.children.push(childId);
  }

  addComponent<K extends ComponentName>(entityId: EntityId, name: K, component: ComponentMap[K]): void {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`EcsWorld: unknown entity id ${entityId}`);
    this.components[name].set(entityId, component);
  }

  getComponent<K extends ComponentName>(entityId: EntityId, name: K): ComponentMap[K] | undefined {
    return this.components[name].get(entityId);
  }

  hasComponent(entityId: EntityId, name: ComponentName): boolean {
    return this.components[name].has(entityId);
  }

  removeComponent(entityId: EntityId, name: ComponentName): void {
    this.components[name].delete(entityId);
  }

  getEntitiesWithComponent(name: ComponentName): EntityId[] {
    const map = this.components[name];
    return Array.from(map.keys());
  }

  /**
   * Convenience for editor workflows: find the "main" transform for an entity.
   */
  getTransform(entityId: EntityId): TransformComponent | undefined {
    return this.getComponent(entityId, 'transform');
  }

  snapshot(): EcsSnapshot {
    return { entities: this.getAllEntities() };
  }
}

