import type { Vec3 } from '../components';
import type { VybScene } from '../scene';

export interface PhysicsWorldConfig {
  gravity: Vec3;
  groundY: number;
}

export interface PhysicsStepStats {
  bodiesSimulated: number;
  collisionsResolved: number;
}

/**
 * Editor/runtime physics scaffold — semi-implicit Euler with ground plane.
 */
export class PhysicsWorld {
  gravity: Vec3;
  groundY: number;

  constructor(config: Partial<PhysicsWorldConfig> = {}) {
    this.gravity = config.gravity ?? { x: 0, y: -9.81, z: 0 };
    this.groundY = config.groundY ?? 0;
  }

  step(scene: VybScene, dt: number): PhysicsStepStats {
    let bodiesSimulated = 0;
    let collisionsResolved = 0;

    for (const entityId of scene.world.getEntitiesWithComponent('rigidbody')) {
      const rb = scene.world.getComponent(entityId, 'rigidbody');
      const transform = scene.world.getTransform(entityId);
      if (!rb?.enabled || !transform) continue;

      bodiesSimulated++;

      if (rb.useGravity) {
        rb.velocity.x += this.gravity.x * dt;
        rb.velocity.y += this.gravity.y * dt;
        rb.velocity.z += this.gravity.z * dt;
      }

      transform.position.x += rb.velocity.x * dt;
      transform.position.y += rb.velocity.y * dt;
      transform.position.z += rb.velocity.z * dt;

      const collider = scene.world.getComponent(entityId, 'collider');
      const halfHeight = collider?.shape === 'sphere' ? (collider.radius ?? 0.5) : (collider?.size?.y ?? 1) / 2;

      if (transform.position.y - halfHeight < this.groundY) {
        transform.position.y = this.groundY + halfHeight;
        rb.velocity.y = Math.max(0, rb.velocity.y * -0.2);
        collisionsResolved++;
      }

      scene.world.updateComponent(entityId, 'transform', transform);
      scene.world.updateComponent(entityId, 'rigidbody', rb);
    }

    return { bodiesSimulated, collisionsResolved };
  }
}
