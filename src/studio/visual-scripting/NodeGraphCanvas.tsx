import { useCallback, useMemo, useRef, useState } from 'react';
import type { ConnectionModel, NodeGraphModel, NodeModel, PinModel } from '../../engine/visual-scripting/NodeGraphModel';
import { canConnectPins, findPin } from '../../engine/visual-scripting/graphUtils';
import {
  addConnectionToGraph,
  addNodeToGraph,
  createNodeFromType,
  removeConnectionFromGraph,
  removeNodeFromGraph,
  updateNodePosition,
} from '../../engine/visual-scripting/graphFactory';
import { BEHAVIOR_NODE_TYPES, SHADER_NODE_TYPES, type NodeTypeId } from '../../engine/visual-scripting/nodeDefinitions';

const NODE_WIDTH = 200;
const NODE_HEADER = 28;
const PIN_ROW = 22;

function pinOffsetY(node: NodeModel, pin: PinModel): number {
  const pins = pin.direction === 'input' ? node.inputPins : node.outputPins;
  const index = pins.findIndex((p) => p.id === pin.id);
  const count = Math.max(pins.length, 1);
  const bodyHeight = count * PIN_ROW;
  return NODE_HEADER + (bodyHeight / count) * (index + 0.5);
}

function pinColor(pinType: PinModel['pinType']): string {
  switch (pinType) {
    case 'exec':
      return '#e8ecf4';
    case 'number':
      return '#5b8def';
    case 'boolean':
      return '#c45bd8';
    case 'vector3':
      return '#3dd68c';
    case 'string':
      return '#f5a623';
    default:
      return '#8b93a7';
  }
}

export function NodeGraphCanvas({
  graph,
  onChange,
  readOnly = false,
}: {
  graph: NodeGraphModel;
  onChange: (graph: NodeGraphModel) => void;
  readOnly?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [linkFromPinId, setLinkFromPinId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const nodeTypes = graph.kind === 'shader' ? SHADER_NODE_TYPES : BEHAVIOR_NODE_TYPES;

  const pinPositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const node of graph.nodes) {
      for (const pin of node.inputPins) {
        map.set(pin.id, { x: node.x, y: node.y + pinOffsetY(node, pin) });
      }
      for (const pin of node.outputPins) {
        map.set(pin.id, { x: node.x + NODE_WIDTH, y: node.y + pinOffsetY(node, pin) });
      }
    }
    return map;
  }, [graph.nodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2, Math.max(0.4, z - e.deltaY * 0.001)));
  }, []);

  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  const onPinClick = (pin: PinModel) => {
    if (readOnly) return;
    if (!linkFromPinId) {
      if (pin.direction === 'output') setLinkFromPinId(pin.id);
      return;
    }
    const from = findPin(graph, linkFromPinId);
    if (!from) {
      setLinkFromPinId(null);
      return;
    }
    if (pin.direction === 'input' && canConnectPins(from, pin)) {
      const exists = graph.connections.some((c) => c.toPinId === pin.id);
      if (!exists) onChange(addConnectionToGraph(graph, linkFromPinId, pin.id));
    }
    setLinkFromPinId(null);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
      return;
    }
    if (!draggingNodeId) return;
    const world = toWorld(e.clientX, e.clientY);
    onChange(
      updateNodePosition(graph, draggingNodeId, world.x - dragOffset.x, world.y - dragOffset.y),
    );
  };

  const onMouseUp = () => {
    setDraggingNodeId(null);
    setPanning(false);
  };

  const renderConnection = (c: ConnectionModel) => {
    const from = pinPositions.get(c.fromPinId);
    const to = pinPositions.get(c.toPinId);
    if (!from || !to) return null;
    const fromPin = findPin(graph, c.fromPinId);
    const cx = (from.x + to.x) / 2;
    return (
      <path
        key={c.id}
        d={`M ${from.x} ${from.y} C ${cx} ${from.y}, ${cx} ${to.y}, ${to.x} ${to.y}`}
        fill="none"
        stroke={fromPin ? pinColor(fromPin.pinType) : '#5b8def'}
        strokeWidth={2}
        opacity={0.75}
        className={readOnly ? '' : 'cursor-pointer hover:opacity-100'}
        onClick={(e) => {
          if (readOnly) return;
          e.stopPropagation();
          onChange(removeConnectionFromGraph(graph, c.id));
        }}
      />
    );
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden rounded-lg border border-vyb-border/60 bg-[#07080c]">
      {!readOnly ? (
        <div className="flex flex-wrap gap-1 p-2 border-b border-vyb-border/40 bg-vyb-panel/20 max-h-[72px] overflow-auto">
          {nodeTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              className="px-2 py-0.5 rounded text-[10px] font-semibold border border-vyb-border/50 bg-black/20 text-vyb-text/70 hover:bg-vyb-accent/15"
              onClick={() => {
                const node = createNodeFromType(t.id as NodeTypeId, 120 + graph.nodes.length * 24, 80 + graph.nodes.length * 16);
                onChange(addNodeToGraph(graph, node));
              }}
            >
              + {t.title}
            </button>
          ))}
          {linkFromPinId ? (
            <span className="text-[10px] text-vyb-accent self-center ml-2">Click target input pin…</span>
          ) : null}
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseDown={(e) => {
          if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
            setPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
          }
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          <g>{graph.connections.map(renderConnection)}</g>
        </svg>

        <div
          className="absolute inset-0"
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
        >
          {graph.nodes.map((node) => (
            <div
              key={node.id}
              className="absolute rounded-lg border border-vyb-border/60 bg-vyb-panel/90 shadow-glass select-none"
              style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
              onMouseDown={(e) => {
                if (readOnly) return;
                e.stopPropagation();
                const world = toWorld(e.clientX, e.clientY);
                setDraggingNodeId(node.id);
                setDragOffset({ x: world.x - node.x, y: world.y - node.y });
              }}
            >
              <div className="flex items-center justify-between px-2 h-7 border-b border-vyb-border/40 bg-black/20 rounded-t-lg">
                <span className="text-[11px] font-bold text-vyb-text/85 truncate">{node.title}</span>
                {!readOnly ? (
                  <button
                    type="button"
                    className="text-[10px] text-vyb-text/40 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(removeNodeFromGraph(graph, node.id));
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div className="py-1 text-[10px]">
                {node.inputPins.map((pin) => (
                  <div key={pin.id} className="flex items-center gap-1 px-1 h-[22px] relative">
                    <button
                      type="button"
                      className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0"
                      style={{ background: pinColor(pin.pinType) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinClick(pin);
                      }}
                    />
                    <span className="text-vyb-text/55">{pin.name}</span>
                  </div>
                ))}
                {node.outputPins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-end gap-1 px-1 h-[22px]">
                    <span className="text-vyb-text/55">{pin.name}</span>
                    <button
                      type="button"
                      className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0"
                      style={{ background: pinColor(pin.pinType) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinClick(pin);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
