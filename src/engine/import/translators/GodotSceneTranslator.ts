import { VybScene } from '../../scene/VybScene';
import { sceneToJson } from '../../scene/sceneSerializer';
import { godotResourcePathToRelative, parseGodotTscn, type GodotTscnNode } from './godotTscnParser';

export interface GodotSceneTranslationResult {
  scene: VybScene;
  sceneJson: string;
  targetRelativePath: string;
  warnings: string[];
}

export class GodotSceneTranslator {
  translate(sourcePath: string, tscnSource: string, sceneName?: string): GodotSceneTranslationResult {
    const nodes = parseGodotTscn(tscnSource);
    const warnings: string[] = [];
    const scene = new VybScene({
      name: sceneName ?? sourcePath.split('/').pop()?.replace(/\.tscn$/i, '') ?? 'Imported Godot Scene',
      version: '0.1.0',
      createdAt: new Date().toISOString(),
    });

    const entityByGodotName = new Map<string, string>();

    for (const node of nodes) {
      const entityId = scene.world.createEntity(node.name);
      entityByGodotName.set(node.name, entityId);

      const transform = node.transform ?? {
        position: { x: 0, y: 0, z: 0 },
        rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
        scale: { x: 1, y: 1, z: 1 },
      };
      scene.world.addComponent(entityId, 'transform', {
        ...transform,
        scale: { x: 1, y: 1, z: 1 },
      });

      this.mapNodeComponents(scene, entityId, node, warnings);
    }

    for (const node of nodes) {
      if (!node.parent || node.parent === '.') continue;
      const childId = entityByGodotName.get(node.name);
      const parentName = node.parent.includes('/') ? node.parent.split('/').pop()! : node.parent;
      const parentId = entityByGodotName.get(parentName);
      if (childId && parentId) scene.world.setParent(parentId, childId);
    }

    const cameraId = [...entityByGodotName.entries()].find(([name]) =>
      nodes.find((n) => n.name === name)?.type.toLowerCase().includes('camera'),
    )?.[1];
    if (cameraId) scene.activeCameraEntityId = cameraId;

    const slug = sourcePath
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      ?.replace(/\.tscn$/i, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .toLowerCase();

    return {
      scene,
      sceneJson: sceneToJson(scene),
      targetRelativePath: `scenes/imported/godot/${slug ?? 'scene'}.vybscene`,
      warnings,
    };
  }

  private mapNodeComponents(
    scene: VybScene,
    entityId: string,
    node: GodotTscnNode,
    warnings: string[],
  ): void {
    const type = node.type.toLowerCase();

    if (type.includes('camera')) {
      scene.world.addComponent(entityId, 'camera', {
        projection: 'perspective',
        fovDegrees: 60,
        near: 0.1,
        far: 500,
        orthographicWidth: 10,
        priority: 1,
      });
      return;
    }

    if (type.includes('directionallight') || type.includes('light')) {
      scene.world.addComponent(entityId, 'light', {
        lightType: type.includes('directional') ? 'directional' : 'point',
        color: { x: 1, y: 1, z: 1 },
        intensity: 3,
        castShadows: true,
      });
      return;
    }

    if (type.includes('meshinstance') || type.includes('mesh')) {
      const meshProp = node.properties.mesh ?? node.properties['mesh'] ?? '';
      const meshPath = meshProp.replace(/^ExtResource\("[^"]+"\)$/, '').trim();
      const relative = meshPath ? godotResourcePathToRelative(meshPath.replace(/"/g, '')) : 'assets/imported/godot/mesh-placeholder.glb';
      scene.world.addComponent(entityId, 'meshRenderer', {
        meshId: `mesh:${relative}`,
        materialIds: ['mat:imported-default'],
        visible: true,
        castShadows: true,
        receiveShadows: true,
      });
      return;
    }

    if (type !== 'node3d' && type !== 'node') {
      warnings.push(`Unsupported Godot node type "${node.type}" on "${node.name}" — imported as empty entity.`);
    }
  }
}
