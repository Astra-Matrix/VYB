export type ImportSourceType = 'vyb' | 'unity' | 'unreal' | 'godot' | 'raw' | 'unknown';

export interface DetectedProject {
  type: ImportSourceType;
  confidence: number;
  rootPath: string;
  markers: string[];
  metadata?: Record<string, string>;
}

export interface ImportDetectionResult {
  detected: DetectedProject[];
  primary?: DetectedProject;
  scannedAt: string;
}

const UNITY_MARKERS = ['Assets', 'ProjectSettings', 'Packages'];
const UNREAL_MARKERS = ['Content', 'Config'];
const VYB_MARKERS = ['.vyb/project.vyb.json'];
const RAW_EXTENSIONS = [
  // Common 3D formats
  '.fbx',
  '.obj',
  '.glb',
  '.gltf',

  // Images / textures
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.hdr',
  '.exr',

  // Audio
  '.wav',
  '.mp3',
  '.ogg',

  // Code / data (scaffold)
  '.ts',
  '.js',
  '.lua',
  '.rs',
  '.wasm',
  '.json',

  // VYB artifacts
  '.vybscene',
  '.vybmat',
  '.vybprefab',
];

export class ImportDetector {
  detectFromDirectoryListing(rootPath: string, entries: string[], recursiveFiles: string[] = []): ImportDetectionResult {
    const detected: DetectedProject[] = [];
    const normalizedEntries = entries.map((e) => e.replace(/\\/g, '/'));

    if (this.hasVybProject(normalizedEntries)) {
      detected.push({
        type: 'vyb',
        confidence: 1,
        rootPath,
        markers: VYB_MARKERS.filter((m) => this.entryExists(normalizedEntries, m)),
      });
    }

    const unityScore = this.scoreMarkers(normalizedEntries, UNITY_MARKERS);
    if (unityScore >= 0.66) {
      detected.push({
        type: 'unity',
        confidence: unityScore,
        rootPath,
        markers: UNITY_MARKERS.filter((m) => normalizedEntries.includes(m)),
      });
    }

    const hasUproject = recursiveFiles.some((f) => f.endsWith('.uproject')) || normalizedEntries.some((e) => e.endsWith('.uproject'));
    const unrealScore = (hasUproject ? 0.5 : 0) + this.scoreMarkers(normalizedEntries, UNREAL_MARKERS) * 0.5;
    if (unrealScore >= 0.5) {
      detected.push({
        type: 'unreal',
        confidence: Math.min(unrealScore, 1),
        rootPath,
        markers: [
          ...UNREAL_MARKERS.filter((m) => normalizedEntries.includes(m)),
          ...(hasUproject ? ['*.uproject'] : []),
        ],
      });
    }

    if (normalizedEntries.includes('project.godot') || recursiveFiles.some((f) => f.endsWith('project.godot'))) {
      detected.push({
        type: 'godot',
        confidence: 0.95,
        rootPath,
        markers: ['project.godot'],
      });
    }

    const rawCount = recursiveFiles.filter((f) =>
      RAW_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext)),
    ).length;
    if (rawCount > 0) {
      detected.push({
        type: 'raw',
        confidence: Math.min(rawCount / 10, 1),
        rootPath,
        markers: [`${rawCount} raw asset files`],
        metadata: { fileCount: String(rawCount) },
      });
    }

    detected.sort((a, b) => b.confidence - a.confidence);
    return {
      detected,
      primary: detected[0],
      scannedAt: new Date().toISOString(),
    };
  }

  private hasVybProject(entries: string[]): boolean {
    return entries.includes('.vyb') || this.entryExists(entries, '.vyb/project.vyb.json');
  }

  private entryExists(entries: string[], marker: string): boolean {
    if (marker.includes('/')) {
      const [dir] = marker.split('/');
      return entries.includes(dir) || entries.includes(marker);
    }
    return entries.includes(marker);
  }

  private scoreMarkers(entries: string[], markers: string[]): number {
    const found = markers.filter((m) => entries.includes(m)).length;
    return found / markers.length;
  }
}
