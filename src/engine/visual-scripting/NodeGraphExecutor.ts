import type { VybScene } from '../scene';
import type { NodeGraphModel, PinModel } from './NodeGraphModel';
import { getLinkedOutputPin, getExecOutputConnections, findNode } from './graphUtils';
import type { NodeTypeId } from './nodeDefinitions';

export interface GraphExecutionContext {
  scene: VybScene;
  dt: number;
  tick: number;
  elapsed?: number;
  targetEntityId?: string;
  log: (message: string) => void;
}

export interface GraphExecutionResult {
  executedNodes: number;
  logs: string[];
}

type NodeData = Record<string, number | string | boolean>;

export class NodeGraphExecutor {
  private readonly nodeOutputs = new Map<string, Map<string, unknown>>();
  private readonly nodeData = new Map<string, NodeData>();

  constructor(private readonly graph: NodeGraphModel) {
    for (const node of graph.nodes) {
      this.nodeData.set(node.id, { ...(node.data ?? {}) });
    }
  }

  runOnStart(ctx: GraphExecutionContext): GraphExecutionResult {
    return this.runFromEvent('event.onStart', ctx);
  }

  runOnTick(ctx: GraphExecutionContext): GraphExecutionResult {
    return this.runFromEvent('event.onTick', ctx);
  }

  private runFromEvent(eventTypeId: NodeTypeId, ctx: GraphExecutionContext): GraphExecutionResult {
    const logs: string[] = [];
    let executedNodes = 0;
    this.lastDt = ctx.dt;
    const eventNodes = this.graph.nodes.filter((n) => n.typeId === eventTypeId);

    for (const eventNode of eventNodes) {
      const execPin = eventNode.outputPins.find((p) => p.pinType === 'exec');
      if (!execPin) continue;
      if (eventTypeId === 'event.onTick') {
        this.setNodeOutput(eventNode.id, 'Delta', ctx.dt);
      }
      executedNodes += this.followExec(execPin.id, ctx, logs);
    }

    return { executedNodes, logs };
  }

  private followExec(execOutPinId: string, ctx: GraphExecutionContext, logs: string[]): number {
    let count = 0;
    const queue = getExecOutputConnections(this.graph, execOutPinId).map((c) => c.toPinId);

    while (queue.length > 0) {
      const inputPinId = queue.shift()!;
      const pin = this.findPin(inputPinId);
      const node = pin ? findNode(this.graph, pin.nodeId) : undefined;
      if (!node || !pin) continue;

      count++;
      const nextExecPins = this.executeNode(node.id, node.typeId as NodeTypeId, ctx, logs);
      for (const next of nextExecPins) {
        const outs = getExecOutputConnections(this.graph, next);
        for (const c of outs) queue.push(c.toPinId);
      }
    }

    return count;
  }

  private executeNode(
    nodeId: string,
    typeId: NodeTypeId,
    ctx: GraphExecutionContext,
    logs: string[],
  ): string[] {
    switch (typeId) {
      case 'flow.branch': {
        const cond = Boolean(this.readNumberInput(nodeId, 'Condition'));
        return [this.findExecOutputPin(nodeId, cond ? 'True' : 'False')].filter(Boolean) as string[];
      }
      case 'math.add': {
        const a = this.readNumberInput(nodeId, 'A');
        const b = this.readNumberInput(nodeId, 'B');
        this.setNodeOutput(nodeId, 'Result', a + b);
        return [];
      }
      case 'math.multiply': {
        const a = this.readNumberInput(nodeId, 'A');
        const b = this.readNumberInput(nodeId, 'B');
        this.setNodeOutput(nodeId, 'Result', a * b);
        return [];
      }
      case 'math.float': {
        const value = Number(this.nodeData.get(nodeId)?.value ?? 0);
        this.setNodeOutput(nodeId, 'Value', value);
        return [];
      }
      case 'entity.rotateY': {
        const degrees = this.readNumberInput(nodeId, 'Degrees');
        const entityId = String(this.nodeData.get(nodeId)?.entityId || ctx.targetEntityId || '');
        if (entityId) {
          const t = ctx.scene.world.getTransform(entityId);
          if (t) {
            ctx.scene.world.updateComponent(entityId, 'transform', {
              ...t,
              rotation: { ...t.rotation, yDeg: t.rotation.yDeg + degrees },
            });
          }
        }
        return [this.findExecOutputPin(nodeId, 'Exec Out')].filter(Boolean) as string[];
      }
      case 'debug.log': {
        const msg = this.readStringInput(nodeId, 'Message');
        ctx.log(msg);
        logs.push(msg);
        return [this.findExecOutputPin(nodeId, 'Exec Out')].filter(Boolean) as string[];
      }
      default:
        return [this.findExecOutputPin(nodeId, 'Exec Out')].filter(Boolean) as string[];
    }
  }

  private readNumberInput(nodeId: string, pinName: string): number {
    const node = findNode(this.graph, nodeId);
    const pin = node?.inputPins.find((p) => p.name === pinName);
    if (!pin) return 0;
    const linked = getLinkedOutputPin(this.graph, pin.id);
    if (linked) {
      this.evaluateDataOutputs(linked.nodeId);
      const val = this.getNodeOutput(linked.nodeId, linked.name);
      return Number(val ?? 0);
    }
    return Number(this.nodeData.get(nodeId)?.[pinName.toLowerCase()] ?? 0);
  }

  private evaluateDataOutputs(nodeId: string): void {
    const node = findNode(this.graph, nodeId);
    if (!node) return;
    switch (node.typeId) {
      case 'math.add': {
        const a = this.readNumberInput(nodeId, 'A');
        const b = this.readNumberInput(nodeId, 'B');
        this.setNodeOutput(nodeId, 'Result', a + b);
        break;
      }
      case 'math.multiply': {
        const a = this.readNumberInput(nodeId, 'A');
        const b = this.readNumberInput(nodeId, 'B');
        this.setNodeOutput(nodeId, 'Result', a * b);
        break;
      }
      case 'math.float': {
        this.setNodeOutput(nodeId, 'Value', Number(this.nodeData.get(nodeId)?.value ?? 0));
        break;
      }
      case 'event.onTick': {
        this.setNodeOutput(nodeId, 'Delta', this.lastDt);
        break;
      }
      default:
        break;
    }
  }

  private lastDt = 0;

  private readStringInput(nodeId: string, pinName: string): string {
    const node = findNode(this.graph, nodeId);
    const pin = node?.inputPins.find((p) => p.name === pinName);
    if (!pin) return '';
    const linked = getLinkedOutputPin(this.graph, pin.id);
    if (linked) return String(this.getNodeOutput(linked.nodeId, linked.name) ?? '');
    return String(this.nodeData.get(nodeId)?.message ?? 'Graph log');
  }

  private findExecOutputPin(nodeId: string, name: string): string | undefined {
    const node = findNode(this.graph, nodeId);
    return node?.outputPins.find((p) => p.name === name && p.pinType === 'exec')?.id;
  }

  private setNodeOutput(nodeId: string, pinName: string, value: unknown): void {
    if (!this.nodeOutputs.has(nodeId)) this.nodeOutputs.set(nodeId, new Map());
    this.nodeOutputs.get(nodeId)!.set(pinName, value);
  }

  private getNodeOutput(nodeId: string, pinName: string): unknown {
    return this.nodeOutputs.get(nodeId)?.get(pinName);
  }

  private findPin(pinId: string): PinModel | undefined {
    for (const node of this.graph.nodes) {
      const p = [...node.inputPins, ...node.outputPins].find((x) => x.id === pinId);
      if (p) return p;
    }
    return undefined;
  }
}
