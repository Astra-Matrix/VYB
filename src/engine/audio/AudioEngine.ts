export interface AudioPlayRequest {
  entityId: string;
  assetId: string;
  volume: number;
  loop: boolean;
  spatial: boolean;
}

export interface AudioEngineStats {
  activeSources: number;
  queuedPlays: number;
}

/**
 * Web Audio scaffold — logs and tracks playback; full spatial audio in later phases.
 */
export class AudioEngine {
  private active = new Map<string, AudioPlayRequest>();
  private queue: AudioPlayRequest[] = [];

  enqueue(request: AudioPlayRequest): void {
    this.queue.push(request);
  }

  tick(dt: number): AudioEngineStats {
    void dt;
    while (this.queue.length > 0) {
      const req = this.queue.shift()!;
      this.active.set(req.entityId, req);
    }
    return { activeSources: this.active.size, queuedPlays: this.queue.length };
  }

  stopAll(): void {
    this.active.clear();
    this.queue = [];
  }
}
