export interface VybMaterialFile {
  metadata: {
    name: string;
    version: string;
    sourceEngine?: 'unity' | 'unreal' | 'godot' | 'raw' | 'vyb';
    sourcePath?: string;
  };
  shader: string;
  properties: {
    baseColor: [number, number, number, number];
    metallic: number;
    roughness: number;
    emissive?: [number, number, number];
  };
  textures: {
    albedo?: string;
    normal?: string;
    metallicRoughness?: string;
  };
}

export function createDefaultMaterial(name: string, source?: VybMaterialFile['metadata']['sourceEngine']): VybMaterialFile {
  return {
    metadata: { name, version: '0.1.0', sourceEngine: source },
    shader: 'shader:vyb-default-lit',
    properties: {
      baseColor: [1, 1, 1, 1],
      metallic: 0,
      roughness: 0.55,
    },
    textures: {},
  };
}

export function materialToJson(material: VybMaterialFile, pretty = true): string {
  return pretty ? JSON.stringify(material, null, 2) : JSON.stringify(material);
}

export function materialFromJson(json: string): VybMaterialFile {
  const data = JSON.parse(json) as VybMaterialFile;
  if (!data.metadata?.name) throw new Error('Invalid .vybmat file: missing metadata.name');
  return data;
}
