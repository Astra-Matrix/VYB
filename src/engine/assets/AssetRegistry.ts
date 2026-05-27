import type { AssetMetadata, AssetType } from './assetTypes';
import { KNOWN_ASSET_EXTENSIONS } from './assetTypes';

export interface AssetScanOptions {
  /**
   * When set, only include assets matching these types.
   */
  includeTypes?: AssetType[];
  /**
   * Only scan file extensions known by VYB.
   */
  knownExtensionsOnly?: boolean;
}

export interface AssetRegistryIndex {
  assets: AssetMetadata[];
  scannedAt: string;
}

export class AssetRegistry {
  private assetsById = new Map<string, AssetMetadata>();

  getAsset(id: string): AssetMetadata | undefined {
    return this.assetsById.get(id);
  }

  getAllAssets(): AssetMetadata[] {
    return Array.from(this.assetsById.values());
  }

  getAssetsByType(type: AssetType): AssetMetadata[] {
    return this.getAllAssets().filter((a) => a.type === type);
  }

  /**
   * scanFiles
   * Converts a list of absolute or project-relative file paths into asset metadata.
   * This function intentionally does not read file contents; indexing stays fast and safe.
   */
  scanFiles(filePaths: string[], options: AssetScanOptions = {}): AssetRegistryIndex {
    const knownExtensionsOnly = options.knownExtensionsOnly ?? true;
    const includeTypes = options.includeTypes;

    const assets: AssetMetadata[] = [];
    for (const filePath of filePaths) {
      const normalized = filePath.replace(/\\/g, '/');
      const extension = (normalized.match(/(\.[^./\\]+)$/)?.[1] ?? '').toLowerCase();
      if (!extension) continue;

      const assetType = KNOWN_ASSET_EXTENSIONS[extension] ?? 'unknown';
      if (knownExtensionsOnly && assetType === 'unknown') continue;
      if (includeTypes && !includeTypes.includes(assetType)) continue;

      const id = `${assetType}:${normalized.split('/').pop() ?? normalized}`;
      const asset: AssetMetadata = {
        id,
        type: assetType,
        path: normalized,
        extension,
      };

      this.assetsById.set(id, asset);
      assets.push(asset);
    }

    const scannedAt = new Date().toISOString();
    return { assets, scannedAt };
  }
}

