import type { NodeTypeId } from './nodeDefinitions';

export type PinDirection = 'input' | 'output';
export type PinType =
  | 'exec'
  | 'number'
  | 'string'
  | 'boolean'
  | 'entity'
  | 'vector3'
  | 'event';

export type GraphKind = 'behavior' | 'shader';

export interface PinModel {
  id: string;
  nodeId: string;
  name: string;
  direction: PinDirection;
  pinType: PinType;
}

export type NodeCategory = 'event' | 'logic' | 'math' | 'entity' | 'shader';

export interface NodeModel {
  id: string;
  typeId: NodeTypeId;
  title: string;
  category: NodeCategory;
  x: number;
  y: number;
  inputPins: PinModel[];
  outputPins: PinModel[];
  data?: Record<string, number | string | boolean>;
}

export interface ConnectionModel {
  id: string;
  fromPinId: string;
  toPinId: string;
}

export interface NodeGraphModel {
  id: string;
  name: string;
  kind: GraphKind;
  nodes: NodeModel[];
  connections: ConnectionModel[];
  createdAt: string;
  updatedAt?: string;
}

const uid = () => crypto.randomUUID?.() ?? String(Math.random());

export function createEmptyGraph(name: string, kind: GraphKind): NodeGraphModel {
  return {
    id: uid(),
    name,
    kind,
    nodes: [],
    connections: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Sample behavior graph: On Tick -> Multiply(Delta, speed) -> Rotate Entity Y
 */
export function createSampleNodeGraph(): NodeGraphModel {
  const graphId = uid();
  const onTickId = uid();
  const floatId = uid();
  const mulId = uid();
  const rotateId = uid();

  const onTickExec = { id: uid(), nodeId: onTickId, name: 'Exec', direction: 'output' as const, pinType: 'exec' as const };
  const onTickDelta = { id: uid(), nodeId: onTickId, name: 'Delta', direction: 'output' as const, pinType: 'number' as const };

  const speedOut = { id: uid(), nodeId: floatId, name: 'Value', direction: 'output' as const, pinType: 'number' as const };

  const mulA = { id: uid(), nodeId: mulId, name: 'A', direction: 'input' as const, pinType: 'number' as const };
  const mulB = { id: uid(), nodeId: mulId, name: 'B', direction: 'input' as const, pinType: 'number' as const };
  const mulOut = { id: uid(), nodeId: mulId, name: 'Result', direction: 'output' as const, pinType: 'number' as const };

  const rotExecIn = { id: uid(), nodeId: rotateId, name: 'Exec In', direction: 'input' as const, pinType: 'exec' as const };
  const rotDeg = { id: uid(), nodeId: rotateId, name: 'Degrees', direction: 'input' as const, pinType: 'number' as const };
  const rotExecOut = { id: uid(), nodeId: rotateId, name: 'Exec Out', direction: 'output' as const, pinType: 'exec' as const };

  return {
    id: graphId,
    name: 'Sample Behavior Graph',
    kind: 'behavior',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: onTickId,
        typeId: 'event.onTick',
        title: 'On Tick',
        category: 'event',
        x: 80,
        y: 120,
        inputPins: [],
        outputPins: [onTickExec, onTickDelta],
      },
      {
        id: floatId,
        typeId: 'math.float',
        title: 'Float',
        category: 'math',
        x: 80,
        y: 280,
        inputPins: [],
        outputPins: [speedOut],
        data: { value: 45 },
      },
      {
        id: mulId,
        typeId: 'math.multiply',
        title: 'Multiply',
        category: 'math',
        x: 360,
        y: 200,
        inputPins: [mulA, mulB],
        outputPins: [mulOut],
      },
      {
        id: rotateId,
        typeId: 'entity.rotateY',
        title: 'Rotate Entity Y',
        category: 'entity',
        x: 640,
        y: 160,
        inputPins: [rotExecIn, rotDeg],
        outputPins: [rotExecOut],
        data: { entityId: '3' },
      },
    ],
    connections: [
      { id: uid(), fromPinId: onTickExec.id, toPinId: rotExecIn.id },
      { id: uid(), fromPinId: onTickDelta.id, toPinId: mulA.id },
      { id: uid(), fromPinId: speedOut.id, toPinId: mulB.id },
      { id: uid(), fromPinId: mulOut.id, toPinId: rotDeg.id },
    ],
  };
}

export function createSampleShaderGraph(): NodeGraphModel {
  const graphId = uid();
  const vecId = uid();
  const outId = uid();
  const vecOut = { id: uid(), nodeId: vecId, name: 'Out', direction: 'output' as const, pinType: 'vector3' as const };
  const colorIn = { id: uid(), nodeId: outId, name: 'Color', direction: 'input' as const, pinType: 'vector3' as const };

  return {
    id: graphId,
    name: 'Sample Shader Graph',
    kind: 'shader',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: vecId,
        typeId: 'shader.vec3',
        title: 'Vec3',
        category: 'shader',
        x: 120,
        y: 140,
        inputPins: [],
        outputPins: [vecOut],
        data: { x: 0.36, y: 0.55, z: 0.94 },
      },
      {
        id: outId,
        typeId: 'shader.output',
        title: 'Surface Output',
        category: 'shader',
        x: 420,
        y: 140,
        inputPins: [colorIn],
        outputPins: [],
      },
    ],
    connections: [{ id: uid(), fromPinId: vecOut.id, toPinId: colorIn.id }],
  };
}
