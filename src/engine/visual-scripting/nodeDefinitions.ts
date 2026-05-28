import type { NodeCategory, PinType } from './NodeGraphModel';

export type NodeTypeId =
  | 'event.onStart'
  | 'event.onTick'
  | 'flow.branch'
  | 'math.add'
  | 'math.multiply'
  | 'math.float'
  | 'entity.rotateY'
  | 'debug.log'
  | 'shader.output'
  | 'shader.float'
  | 'shader.vec3'
  | 'shader.multiply'
  | 'shader.add'
  | 'shader.combine';

export interface PinDefinition {
  name: string;
  direction: 'input' | 'output';
  pinType: PinType;
}

export interface NodeTypeDefinition {
  id: NodeTypeId;
  title: string;
  category: NodeCategory | 'shader';
  inputPins: Omit<PinDefinition, 'direction'>[];
  outputPins: Omit<PinDefinition, 'direction'>[];
  defaultData?: Record<string, number | string | boolean>;
}

export const BEHAVIOR_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: 'event.onStart',
    title: 'On Start',
    category: 'event',
    inputPins: [],
    outputPins: [{ name: 'Exec', pinType: 'exec' }],
  },
  {
    id: 'event.onTick',
    title: 'On Tick',
    category: 'event',
    inputPins: [],
    outputPins: [
      { name: 'Exec', pinType: 'exec' },
      { name: 'Delta', pinType: 'number' },
    ],
  },
  {
    id: 'flow.branch',
    title: 'Branch',
    category: 'logic',
    inputPins: [
      { name: 'Exec In', pinType: 'exec' },
      { name: 'Condition', pinType: 'boolean' },
    ],
    outputPins: [
      { name: 'True', pinType: 'exec' },
      { name: 'False', pinType: 'exec' },
    ],
  },
  {
    id: 'math.float',
    title: 'Float',
    category: 'math',
    inputPins: [],
    outputPins: [{ name: 'Value', pinType: 'number' }],
    defaultData: { value: 1 },
  },
  {
    id: 'math.add',
    title: 'Add',
    category: 'math',
    inputPins: [
      { name: 'A', pinType: 'number' },
      { name: 'B', pinType: 'number' },
    ],
    outputPins: [{ name: 'Result', pinType: 'number' }],
  },
  {
    id: 'math.multiply',
    title: 'Multiply',
    category: 'math',
    inputPins: [
      { name: 'A', pinType: 'number' },
      { name: 'B', pinType: 'number' },
    ],
    outputPins: [{ name: 'Result', pinType: 'number' }],
  },
  {
    id: 'entity.rotateY',
    title: 'Rotate Entity Y',
    category: 'entity',
    inputPins: [
      { name: 'Exec In', pinType: 'exec' },
      { name: 'Degrees', pinType: 'number' },
    ],
    outputPins: [{ name: 'Exec Out', pinType: 'exec' }],
    defaultData: { entityId: '' },
  },
  {
    id: 'debug.log',
    title: 'Log',
    category: 'logic',
    inputPins: [
      { name: 'Exec In', pinType: 'exec' },
      { name: 'Message', pinType: 'string' },
    ],
    outputPins: [{ name: 'Exec Out', pinType: 'exec' }],
    defaultData: { message: 'Hello from graph' },
  },
];

export const SHADER_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: 'shader.float',
    title: 'Float',
    category: 'shader',
    inputPins: [],
    outputPins: [{ name: 'Out', pinType: 'number' }],
    defaultData: { value: 0.5 },
  },
  {
    id: 'shader.vec3',
    title: 'Vec3',
    category: 'shader',
    inputPins: [],
    outputPins: [{ name: 'Out', pinType: 'vector3' }],
    defaultData: { x: 0.36, y: 0.55, z: 0.94 },
  },
  {
    id: 'shader.multiply',
    title: 'Multiply',
    category: 'shader',
    inputPins: [
      { name: 'A', pinType: 'number' },
      { name: 'B', pinType: 'number' },
    ],
    outputPins: [{ name: 'Out', pinType: 'number' }],
  },
  {
    id: 'shader.add',
    title: 'Add',
    category: 'shader',
    inputPins: [
      { name: 'A', pinType: 'number' },
      { name: 'B', pinType: 'number' },
    ],
    outputPins: [{ name: 'Out', pinType: 'number' }],
  },
  {
    id: 'shader.combine',
    title: 'Combine RGB',
    category: 'shader',
    inputPins: [
      { name: 'R', pinType: 'number' },
      { name: 'G', pinType: 'number' },
      { name: 'B', pinType: 'number' },
    ],
    outputPins: [{ name: 'Out', pinType: 'vector3' }],
  },
  {
    id: 'shader.output',
    title: 'Surface Output',
    category: 'shader',
    inputPins: [{ name: 'Color', pinType: 'vector3' }],
    outputPins: [],
  },
];

export function getNodeTypeDefinition(id: NodeTypeId): NodeTypeDefinition | undefined {
  return [...BEHAVIOR_NODE_TYPES, ...SHADER_NODE_TYPES].find((t) => t.id === id);
}
