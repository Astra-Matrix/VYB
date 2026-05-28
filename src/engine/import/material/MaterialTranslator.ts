import type { ImportSourceType } from '../ImportDetector';
import { createDefaultMaterial, type VybMaterialFile } from './VybMaterialFile';

export interface MaterialTranslationInput {
  name: string;
  sourceEngine: ImportSourceType;
  sourcePath: string;
  albedoTexture?: string;
  metallic?: number;
  roughness?: number;
}

export interface MaterialTranslationResult {
  material: VybMaterialFile;
  targetRelativePath: string;
}

/**
 * Converts external engine material hints into VYB .vybmat JSON.
 */
export class MaterialTranslator {
  translate(input: MaterialTranslationInput): MaterialTranslationResult {
    const material = createDefaultMaterial(input.name, input.sourceEngine === 'unknown' ? undefined : input.sourceEngine);
    material.metadata.sourcePath = input.sourcePath;
    if (input.albedoTexture) material.textures.albedo = input.albedoTexture;
    if (input.metallic !== undefined) material.properties.metallic = input.metallic;
    if (input.roughness !== undefined) material.properties.roughness = input.roughness;

    const slug = slugify(input.name);
    return {
      material,
      targetRelativePath: `materials/imported/${input.sourceEngine}/${slug}.vybmat`,
    };
  }

  translateGodotResourcePath(resourcePath: string, importedAlbedo?: string): MaterialTranslationResult {
    const name = resourcePath.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Material';
    return this.translate({
      name,
      sourceEngine: 'godot',
      sourcePath: resourcePath,
      albedoTexture: importedAlbedo,
      roughness: 0.5,
    });
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'material';
}
