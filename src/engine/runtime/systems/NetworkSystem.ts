import { NetworkSession } from '../../networking/NetworkSession';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class NetworkSystem implements RuntimeSystem {
  readonly id = 'network';
  readonly session: NetworkSession;
  lastStats = { connectedPeers: 0, outboundKbps: 0, inboundKbps: 0 };

  constructor() {
    this.session = new NetworkSession({ role: 'host', maxPlayers: 16, tickRate: 30 });
    this.session.connectPeer({ id: 'local', displayName: 'Host (you)', latencyMs: 0 });
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    const stats = this.session.tickSimulation(ctx.tick.dt);
    this.lastStats = {
      connectedPeers: stats.connectedPeers,
      outboundKbps: stats.outboundKbps,
      inboundKbps: stats.inboundKbps,
    };
  }
}
