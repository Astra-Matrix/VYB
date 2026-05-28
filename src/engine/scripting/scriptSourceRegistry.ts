/**
 * In-memory script sources keyed by project-relative entry path.
 */
export class ScriptSourceRegistry {
  private readonly sources = new Map<string, string>();

  register(entry: string, source: string): void {
    this.sources.set(normalizeEntry(entry), source);
  }

  registerMany(entries: Record<string, string>): void {
    for (const [entry, source] of Object.entries(entries)) {
      this.register(entry, source);
    }
  }

  get(entry: string): string | undefined {
    return this.sources.get(normalizeEntry(entry));
  }

  has(entry: string): boolean {
    return this.sources.has(normalizeEntry(entry));
  }
}

export function normalizeEntry(entry: string): string {
  return entry.replace(/\\/g, '/').replace(/^\.\//, '');
}
