export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export type Vec4 = { x: number; y: number; z: number; w: number };

export type RotationEuler = { xDeg: number; yDeg: number; zDeg: number };

/**
 * TransformComponent
 * Editor-side representation of spatial transform.
 */
export interface TransformComponent {
  position: Vec3;
  rotation: RotationEuler;
  scale: Vec3;
  /**
   * Optional parent entity id for hierarchy transforms.
   * If set, local transform is stored relative to the parent.
   */
  parentEntityId?: string;
}

/**
 * CameraComponent
 * Defines projection settings for viewport rendering and editor camera behavior.
 */
export interface CameraComponent {
  projection: 'perspective' | 'orthographic';
  fovDegrees: number;
  near: number;
  far: number;
  orthographicWidth: number;
  /**
   * Render order / priority for editor selection.
   */
  priority: number;
}

/**
 * LightComponent
 * Defines lighting properties for editor rendering placeholders.
 */
export interface LightComponent {
  lightType: 'directional' | 'point' | 'spot';
  color: Vec3;
  intensity: number;
  castShadows: boolean;
  /**
   * Spot-only: inner/outer cone angles.
   */
  coneAngles?: { innerDegrees: number; outerDegrees: number };
}

/**
 * MeshRendererComponent
 * Links an entity to a mesh asset and optional materials.
 */
export interface MeshRendererComponent {
  meshId: string;
  materialIds: string[];
  visible: boolean;
  castShadows: boolean;
  receiveShadows: boolean;
}

/**
 * MaterialComponent
 * Optional convenience component if material assignment is managed separately
 * from MeshRendererComponent (useful for editor workflows).
 */
export interface MaterialComponent {
  materialId: string;
}

/**
 * ScriptComponent
 * Declares a script entry for the entity.
 */
export interface ScriptComponent {
  language: 'typescript' | 'javascript' | 'lua' | 'rust' | 'wasm';
  entry: string;
  /**
   * Optional arbitrary configuration passed to the script runtime.
   */
  parameters?: Record<string, unknown>;
}

/**
 * RigidbodyComponent
 * Editor-side rigid body properties (runtime integration comes later).
 */
export interface RigidbodyComponent {
  enabled: boolean;
  mass: number;
  useGravity: boolean;
  velocity: Vec3;
  angularVelocity: Vec3;
}

/**
 * ColliderComponent
 * Editor-side collider definition (shape + dimensions).
 */
export interface ColliderComponent {
  shape: 'box' | 'sphere' | 'capsule' | 'mesh';
  size?: Vec3;
  radius?: number;
  height?: number;
  /**
   * Whether collisions are enabled for this body.
   */
  enabled: boolean;
}

/**
 * AudioSourceComponent
 * Declares audio asset playback settings for editor preview placeholders.
 */
export interface AudioSourceComponent {
  assetId: string;
  volume: number;
  loop: boolean;
  spatial: boolean;
}

/**
 * UIElementComponent
 * Declares an entity as a UI element in the scene UI system.
 */
export interface UIElementComponent {
  elementType: 'panel' | 'button' | 'text' | 'image' | 'layout';
  /**
   * Simple layout model for editor preview; production UI will use a richer system.
   */
  layout: {
    position: Vec2;
    size: Vec2;
    anchor: 'top-left' | 'top-center' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  };
  visible: boolean;
}

/**
 * AIBehaviorComponent
 * Links an entity to an AI behavior graph asset.
 */
export interface AIBehaviorComponent {
  behaviorGraphId: string;
}

/**
 * NetworkIdentityComponent
 * Declares entity identity for multiplayer synchronization.
 */
export interface NetworkIdentityComponent {
  networkId: string;
  /**
   * Whether this entity is owned by the local client.
   */
  owner: 'local' | 'remote' | 'server';
}

/**
 * Component registry mapping component names to their TypeScript interfaces.
 * This powers typed access in the editor-side ECS world.
 */
export interface ComponentMap {
  transform: TransformComponent;
  camera: CameraComponent;
  light: LightComponent;
  meshRenderer: MeshRendererComponent;
  material: MaterialComponent;
  script: ScriptComponent;
  rigidbody: RigidbodyComponent;
  collider: ColliderComponent;
  audioSource: AudioSourceComponent;
  uiElement: UIElementComponent;
  aiBehavior: AIBehaviorComponent;
  networkIdentity: NetworkIdentityComponent;
}

export type ComponentName = keyof ComponentMap;

