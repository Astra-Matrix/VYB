import type { NodeGraphModel } from './NodeGraphModel';

export function graphToJson(graph: NodeGraphModel): string {
  return JSON.stringify(graph, null, 2);
}

export function graphFromJson(json: string): NodeGraphModel {
  const data = JSON.parse(json) as NodeGraphModel;
  if (!data.id || !Array.isArray(data.nodes)) throw new Error('Invalid node graph JSON');
  return data;
}
