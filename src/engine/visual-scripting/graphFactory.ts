import type { NodeGraphModel, NodeModel, PinModel } from './NodeGraphModel';
import { getNodeTypeDefinition, type NodeTypeDefinition, type NodeTypeId } from './nodeDefinitions';

const uid = () => crypto.randomUUID?.() ?? String(Math.random());

export function createNodeFromType(typeId: NodeTypeId, x: number, y: number): NodeModel {
  const def = getNodeTypeDefinition(typeId);
  if (!def) throw new Error(`Unknown node type: ${typeId}`);
  return instantiateNode(def, x, y);
}

function instantiateNode(def: NodeTypeDefinition, x: number, y: number): NodeModel {
  const nodeId = uid();
  const inputPins: PinModel[] = def.inputPins.map((p) => ({
    id: uid(),
    nodeId,
    name: p.name,
    direction: 'input',
    pinType: p.pinType,
  }));
  const outputPins: PinModel[] = def.outputPins.map((p) => ({
    id: uid(),
    nodeId,
    name: p.name,
    direction: 'output',
    pinType: p.pinType,
  }));

  return {
    id: nodeId,
    typeId: def.id,
    title: def.title,
    category: def.category === 'shader' ? 'shader' : def.category,
    x,
    y,
    inputPins,
    outputPins,
    data: def.defaultData ? { ...def.defaultData } : undefined,
  };
}

export function addNodeToGraph(graph: NodeGraphModel, node: NodeModel): NodeGraphModel {
  return { ...graph, nodes: [...graph.nodes, node], updatedAt: new Date().toISOString() };
}

export function addConnectionToGraph(
  graph: NodeGraphModel,
  fromPinId: string,
  toPinId: string,
): NodeGraphModel {
  return {
    ...graph,
    connections: [...graph.connections, { id: uid(), fromPinId, toPinId }],
    updatedAt: new Date().toISOString(),
  };
}

export function removeConnectionFromGraph(graph: NodeGraphModel, connectionId: string): NodeGraphModel {
  return {
    ...graph,
    connections: graph.connections.filter((c) => c.id !== connectionId),
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodePosition(graph: NodeGraphModel, nodeId: string, x: number, y: number): NodeGraphModel {
  return {
    ...graph,
    nodes: graph.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    updatedAt: new Date().toISOString(),
  };
}

export function removeNodeFromGraph(graph: NodeGraphModel, nodeId: string): NodeGraphModel {
  const pinIds = new Set(
    graph.nodes
      .filter((n) => n.id === nodeId)
      .flatMap((n) => [...n.inputPins, ...n.outputPins].map((p) => p.id)),
  );
  return {
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== nodeId),
    connections: graph.connections.filter((c) => !pinIds.has(c.fromPinId) && !pinIds.has(c.toPinId)),
    updatedAt: new Date().toISOString(),
  };
}
