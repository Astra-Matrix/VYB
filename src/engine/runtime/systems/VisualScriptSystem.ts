import type { NodeGraphModel } from '../../visual-scripting/NodeGraphModel';
import { NodeGraphExecutor } from '../../visual-scripting/NodeGraphExecutor';
import type { RuntimeSystem, RuntimeSystemContext } from '../RuntimeSystem';

export class VisualScriptSystem implements RuntimeSystem {
  readonly id = 'visual-script';
  private executor: NodeGraphExecutor | null = null;

  constructor(
    private readonly getGraph: () => NodeGraphModel | null | undefined,
    private readonly targetEntityId?: string,
  ) {}

  async onStart(ctx: RuntimeSystemContext): Promise<void> {
    const graph = this.getGraph();
    if (!graph || graph.kind !== 'behavior') return;
    this.executor = new NodeGraphExecutor(graph);
    this.executor.runOnStart({
      scene: ctx.scene,
      dt: ctx.tick.dt,
      tick: ctx.tick.tick,
      elapsed: ctx.tick.elapsed,
      targetEntityId: this.targetEntityId,
      log: (m) => ctx.log('info', `[graph] ${m}`),
    });
  }

  async onTick(ctx: RuntimeSystemContext): Promise<void> {
    const graph = this.getGraph();
    if (!graph || graph.kind !== 'behavior') return;
    if (!this.executor) this.executor = new NodeGraphExecutor(graph);
    this.executor.runOnTick({
      scene: ctx.scene,
      dt: ctx.tick.dt,
      tick: ctx.tick.tick,
      elapsed: ctx.tick.elapsed,
      targetEntityId: this.targetEntityId,
      log: (m) => ctx.log('info', `[graph] ${m}`),
    });
  }
}
