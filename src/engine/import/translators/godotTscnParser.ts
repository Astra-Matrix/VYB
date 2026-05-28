export interface GodotTscnNode {
  name: string;
  type: string;
  parent?: string;
  transform?: { position: { x: number; y: number; z: number }; rotation: { xDeg: number; yDeg: number; zDeg: number } };
  properties: Record<string, string>;
}

export function parseGodotTscn(source: string): GodotTscnNode[] {
  const nodes: GodotTscnNode[] = [];
  let current: GodotTscnNode | undefined;
  const lines = source.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[node ')) {
      const nameMatch = trimmed.match(/name="([^"]+)"/);
      const typeMatch = trimmed.match(/type="([^"]+)"/);
      const parentMatch = trimmed.match(/parent="([^"]+)"/);
      if (!nameMatch || !typeMatch) continue;
      current = {
        name: nameMatch[1]!,
        type: typeMatch[1]!,
        parent: parentMatch?.[1],
        properties: {},
      };
      nodes.push(current);
      continue;
    }

    if (!current || !trimmed || trimmed.startsWith('[')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    current.properties[key] = value;
    if (key === 'transform' && value.startsWith('Transform3D(')) {
      current.transform = parseTransform3D(value);
    }
  }

  return nodes;
}

function parseTransform3D(value: string): GodotTscnNode['transform'] {
  const inner = value.slice('Transform3D('.length, -1);
  const parts = inner.split(',').map((p) => Number(p.trim()));
  return {
    position: { x: parts[9] ?? 0, y: parts[10] ?? 0, z: parts[11] ?? 0 },
    rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
  };
}

export function godotResourcePathToRelative(resourcePath: string): string {
  const cleaned = resourcePath.replace(/^res:\/\//, '').replace(/^"/, '').replace(/"$/, '');
  if (cleaned.startsWith('assets/')) return cleaned;
  const file = cleaned.split('/').pop() ?? cleaned;
  return `assets/imported/godot/${file}`;
}
