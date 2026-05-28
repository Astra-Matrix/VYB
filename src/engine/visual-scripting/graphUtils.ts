import type { ConnectionModel, NodeGraphModel, NodeModel, PinModel } from './NodeGraphModel';

export function findPin(graph: NodeGraphModel, pinId: string): PinModel | undefined {
  for (const node of graph.nodes) {
    const pin = [...node.inputPins, ...node.outputPins].find((p) => p.id === pinId);
    if (pin) return pin;
  }
  return undefined;
}

export function findNode(graph: NodeGraphModel, nodeId: string): NodeModel | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

export function getPinOwner(graph: NodeGraphModel, pinId: string): NodeModel | undefined {
  const pin = findPin(graph, pinId);
  if (!pin) return undefined;
  return findNode(graph, pin.nodeId);
}

export function canConnectPins(from: PinModel, to: PinModel): boolean {
  if (from.direction !== 'output' || to.direction !== 'input') return false;
  if (from.pinType !== to.pinType) return false;
  if (from.nodeId === to.nodeId) return false;
  return true;
}

export function getConnectionsToPin(graph: NodeGraphModel, pinId: string): ConnectionModel[] {
  return graph.connections.filter((c) => c.toPinId === pinId);
}

export function getConnectionsFromPin(graph: NodeGraphModel, pinId: string): ConnectionModel[] {
  return graph.connections.filter((c) => c.fromPinId === pinId);
}

export function getLinkedOutputPin(graph: NodeGraphModel, inputPinId: string): PinModel | undefined {
  const conn = getConnectionsToPin(graph, inputPinId)[0];
  if (!conn) return undefined;
  return findPin(graph, conn.fromPinId);
}

export function getExecOutputConnections(graph: NodeGraphModel, execOutPinId: string): ConnectionModel[] {
  const pin = findPin(graph, execOutPinId);
  if (!pin || pin.pinType !== 'exec') return [];
  return getConnectionsFromPin(graph, execOutPinId);
}
