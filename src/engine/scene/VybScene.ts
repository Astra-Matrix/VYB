import type { Vec3 } from '../components';
import type { AudioSourceComponent, CameraComponent, LightComponent, MeshRendererComponent, TransformComponent } from '../components';
import { EcsWorld, type EntityId } from '../ecs';

export interface SceneMetadata {
  name: string;
  version: string;
  createdAt: string;
}

export interface SceneEntitySelection {
  selectedEntityId?: EntityId;
}

/**
 * VybScene
 * Editor-side scene model (ECS world + active camera/lights metadata).
 */
export class VybScene {
  readonly world: EcsWorld;
  readonly metadata: SceneMetadata;
  activeCameraEntityId?: EntityId;

  constructor(metadata: SceneMetadata) {
    this.metadata = metadata;
    this.world = new EcsWorld();
  }

  getEntityName(entityId: EntityId): string {
    return this.world.getEntity(entityId)?.name ?? entityId;
  }
}

export interface SampleSceneData {
  scene: VybScene;
  cameraEntityId: EntityId;
  cubeEntityId: EntityId;
  planeEntityId: EntityId;
  audioEntityId: EntityId;
  emptyEntityId: EntityId;
}

const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

/**
 * createSampleScene
 * Provides production-grade editor scaffolding: camera, directional light,
 * a cube, a grid plane, an empty audio source, and an empty entity for hierarchy demos.
 */
export function createSampleScene(): SampleSceneData {
  const scene = new VybScene({
    name: 'Sample Scene',
    version: '0.1.0',
    createdAt: new Date().toISOString(),
  });

  const cameraEntityId = scene.world.createEntity('Camera');
  const lightEntityId = scene.world.createEntity('Directional Light');
  const cubeEntityId = scene.world.createEntity('Cube');
  const planeEntityId = scene.world.createEntity('Plane / Grid');
  const emptyEntityId = scene.world.createEntity('Empty');
  const audioEntityId = scene.world.createEntity('Audio Source');

  // Hierarchy for editor usefulness: make light a child of empty.
  scene.world.setParent(emptyEntityId, lightEntityId);
  scene.world.setParent(emptyEntityId, cubeEntityId);

  const transform = (position: Vec3, rotation: TransformComponent['rotation'], scale: Vec3, parentEntityId?: string): TransformComponent => ({
    position,
    rotation,
    scale,
    parentEntityId,
  });

  const defaultRot: TransformComponent['rotation'] = { xDeg: 0, yDeg: 0, zDeg: 0 };

  const camera: CameraComponent = {
    projection: 'perspective',
    fovDegrees: 60,
    near: 0.1,
    far: 500,
    orthographicWidth: 10,
    priority: 1,
  };

  const light: LightComponent = {
    lightType: 'directional',
    color: v3(1, 1, 1),
    intensity: 3.0,
    castShadows: true,
  };

  const cubeMeshRenderer: MeshRendererComponent = {
    meshId: 'mesh:unit-cube',
    materialIds: ['mat:default'],
    visible: true,
    castShadows: true,
    receiveShadows: true,
  };

  const planeMeshRenderer: MeshRendererComponent = {
    meshId: 'mesh:grid-plane',
    materialIds: ['mat:grid'],
    visible: true,
    castShadows: false,
    receiveShadows: false,
  };

  const audio: AudioSourceComponent = {
    assetId: 'audio:placeholder.wav',
    volume: 0.8,
    loop: true,
    spatial: false,
  };

  scene.world.addComponent(cameraEntityId, 'transform', transform(v3(3, 2, 6), defaultRot, v3(1, 1, 1)));
  scene.world.addComponent(cameraEntityId, 'camera', camera);

  scene.activeCameraEntityId = cameraEntityId;

  scene.world.addComponent(lightEntityId, 'transform', transform(v3(0, 3, 0), defaultRot, v3(1, 1, 1), emptyEntityId));
  scene.world.addComponent(lightEntityId, 'light', light);

  scene.world.addComponent(cubeEntityId, 'transform', transform(v3(0, 2, 0), defaultRot, v3(1, 1, 1), emptyEntityId));
  scene.world.addComponent(cubeEntityId, 'meshRenderer', cubeMeshRenderer);
  scene.world.addComponent(cubeEntityId, 'rigidbody', {
    enabled: true,
    mass: 1,
    useGravity: true,
    velocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
  });
  scene.world.addComponent(cubeEntityId, 'collider', {
    shape: 'box',
    size: { x: 1, y: 1, z: 1 },
    enabled: true,
  });

  scene.world.addComponent(planeEntityId, 'transform', transform(v3(0, 0, 0), defaultRot, v3(6, 1, 6)));
  scene.world.addComponent(planeEntityId, 'meshRenderer', planeMeshRenderer);

  scene.world.addComponent(audioEntityId, 'transform', transform(v3(-2, 1, 0), defaultRot, v3(1, 1, 1)));
  scene.world.addComponent(audioEntityId, 'audioSource', audio);

  // Empty entity is intentionally missing mesh/light components to demonstrate inspector behavior.
  return {
    scene,
    cameraEntityId,
    cubeEntityId,
    planeEntityId,
    audioEntityId,
    emptyEntityId,
  };
}

/**
 * createEmptyScene
 * Useful when opening real projects (future) or translating imported scenes.
 */
export function createEmptyScene(name = 'Untitled Scene'): VybScene {
  return new VybScene({ name, version: '0.1.0', createdAt: new Date().toISOString() });
}

