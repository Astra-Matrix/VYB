export type NetworkRole = 'offline' | 'host' | 'client';

export interface NetworkPeer {
  id: string;
  displayName: string;
  latencyMs: number;
}

export interface NetworkSessionConfig {
  role: NetworkRole;
  maxPlayers: number;
  tickRate: number;
}

export interface NetworkSessionStats {
  role: NetworkRole;
  connectedPeers: number;
  outboundKbps: number;
  inboundKbps: number;
}

/**
 * Multiplayer session scaffold — tracks peers and simulated bandwidth.
 */
export class NetworkSession {
  private peers: NetworkPeer[] = [];
  private tick = 0;

  constructor(readonly config: NetworkSessionConfig) {}

  connectPeer(peer: NetworkPeer): void {
    if (this.peers.some((p) => p.id === peer.id)) return;
    this.peers.push(peer);
  }

  disconnectPeer(peerId: string): void {
    this.peers = this.peers.filter((p) => p.id !== peerId);
  }

  tickSimulation(dt: number): NetworkSessionStats {
    void dt;
    this.tick++;
    return {
      role: this.config.role,
      connectedPeers: this.peers.length,
      outboundKbps: this.peers.length * 12.5,
      inboundKbps: this.peers.length * 8.2,
    };
  }

  getPeers(): NetworkPeer[] {
    return this.peers;
  }
}
