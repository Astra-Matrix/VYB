import { VybScene } from '../../scene/VybScene';
import { sceneToJson } from '../../scene/sceneSerializer';

export interface RawAssetSceneOptions {
  meshFiles: string[];
  sceneName?: string;
}

export class RawAssetSceneBuilder {
  build(options: RawAssetSceneOptions): { scene: VybScene; sceneJson: string; targetRelativePath: string } {
    const scene = new VybScene({
      name: options.sceneName ?? 'Imported Raw Assets',
      version: '0.1.0',
      createdAt: new Date().toISOString(),
    });

    const cameraId = scene.world.createEntity('Camera');
    scene.world.addComponent(cameraId, 'transform', {
      position: { x: 4, y: 3, z: 8 },
      rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    scene.world.addComponent(cameraId, 'camera', {
      projection: 'perspective',
      fovDegrees: 60,
      near: 0.1,
      far: 500,
      orthographicWidth: 10,
      priority: 1,
    });
    scene.activeCameraEntityId = cameraId;

    const lightId = scene.world.createEntity('Directional Light');
    scene.world.addComponent(lightId, 'transform', {
      position: { x: 0, y: 4, z: 0 },
      rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    scene.world.addComponent(lightId, 'light', {
      lightType: 'directional',
      color: { x: 1, y: 1, z: 1 },
      intensity: 3,
      castShadows: true,
    });

    let offset = 0;
    for (const file of options.meshFiles.slice(0, 12)) {
      const name = file.split(/[/\\]/).pop() ?? 'Mesh';
      const id = scene.world.createEntity(name);
      scene.world.addComponent(id, 'transform', {
        position: { x: offset, y: 0.5, z: 0 },
        rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
        scale: { x: 1, y: 1, z: 1 },
      });
      const normalized = file.replace(/\\/g, '/');
      const rel = normalized.includes('assets/') ? normalized : `assets/imported/raw/${name}`;
      scene.world.addComponent(id, 'meshRenderer', {
        meshId: `mesh:${rel}`,
        materialIds: ['mat:imported-default'],
        visible: true,
        castShadows: true,
        receiveShadows: true,
      });
      offset += 2.5;
    }

    return {
      scene,
      sceneJson: sceneToJson(scene),
      targetRelativePath: 'scenes/imported/raw/auto-layout.vybscene',
    };
  }
}
