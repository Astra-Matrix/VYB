export type PinDirection = 'input' | 'output';
export type PinType =
  | 'exec'
  | 'number'
  | 'string'
  | 'boolean'
  | 'entity'
  | 'vector3'
  | 'event';

export interface PinModel {
  id: string;
  nodeId: string;
  name: string;
  direction: PinDirection;
  pinType: PinType;
}

export type NodeCategory = 'event' | 'logic' | 'math' | 'entity';

export interface NodeModel {
  id: string;
  title: string;
  category: NodeCategory;
  x: number;
  y: number;
  inputPins: PinModel[];
  outputPins: PinModel[];
}

export interface ConnectionModel {
  id: string;
  fromPinId: string;
  toPinId: string;
}

export type ExecutionGraphType = 'execution';
export type DataGraphType = 'data';

export interface NodeGraphModel {
  id: string;
  name: string;
  executionType: ExecutionGraphType;
  nodes: NodeModel[];
  connections: ConnectionModel[];
  createdAt: string;
}

const uid = () => crypto.randomUUID?.() ?? String(Math.random());

/**
 * createSampleNodeGraph
 * Provides a simple event -> math -> entity example graph.
 */
export function createSampleNodeGraph(): NodeGraphModel {
  const graphId = uid();

  const onStartNodeId = uid();
  const addNodeId = uid();
  const entityNodeId = uid();

  const onStartEventPin = {
    id: uid(),
    nodeId: onStartNodeId,
    name: 'Start',
    direction: 'output' as const,
    pinType: 'event' as const,
  };

  const execInPin = {
    id: uid(),
    nodeId: addNodeId,
    name: 'Exec In',
    direction: 'input' as const,
    pinType: 'exec' as const,
  };
  const execOutPin = {
    id: uid(),
    nodeId: addNodeId,
    name: 'Exec Out',
    direction: 'output' as const,
    pinType: 'exec' as const,
  };
  const aPin = {
    id: uid(),
    nodeId: addNodeId,
    name: 'A',
    direction: 'input' as const,
    pinType: 'number' as const,
  };
  const bPin = {
    id: uid(),
    nodeId: addNodeId,
    name: 'B',
    direction: 'input' as const,
    pinType: 'number' as const,
  };
  const sumPin = {
    id: uid(),
    nodeId: addNodeId,
    name: 'Sum',
    direction: 'output' as const,
    pinType: 'number' as const,
  };

  const entityInPin = {
    id: uid(),
    nodeId: entityNodeId,
    name: 'Entity',
    direction: 'input' as const,
    pinType: 'entity' as const,
  };

  const execEntityInPin = {
    id: uid(),
    nodeId: entityNodeId,
    name: 'Exec In',
    direction: 'input' as const,
    pinType: 'exec' as const,
  };

  const execEntityOutPin = {
    id: uid(),
    nodeId: entityNodeId,
    name: 'Exec Out',
    direction: 'output' as const,
    pinType: 'exec' as const,
  };

  const graph: NodeGraphModel = {
    id: graphId,
    name: 'Sample Behavior Graph',
    executionType: 'execution',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: onStartNodeId,
        title: 'On Start',
        category: 'event',
        x: 100,
        y: 100,
        inputPins: [],
        outputPins: [onStartEventPin],
      },
      {
        id: addNodeId,
        title: 'Add (Math)',
        category: 'math',
        x: 400,
        y: 120,
        inputPins: [execInPin, aPin, bPin],
        outputPins: [execOutPin, sumPin],
      },
      {
        id: entityNodeId,
        title: 'Entity: Set Enabled',
        category: 'entity',
        x: 700,
        y: 120,
        inputPins: [execEntityInPin, entityInPin],
        outputPins: [execEntityOutPin],
      },
    ],
    connections: [
      { id: uid(), fromPinId: onStartEventPin.id, toPinId: execInPin.id },
      { id: uid(), fromPinId: execOutPin.id, toPinId: execEntityInPin.id },
    ],
  };

  return graph;
}

