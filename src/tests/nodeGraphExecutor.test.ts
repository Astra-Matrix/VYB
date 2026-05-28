import { describe, expect, it } from 'vitest';
import { createSampleNodeGraph } from '../engine/visual-scripting/NodeGraphModel';
import { NodeGraphExecutor } from '../engine/visual-scripting/NodeGraphExecutor';
import { createSampleScene } from '../engine/scene';

describe('NodeGraphExecutor', () => {
  it('rotates entity on tick via behavior graph', () => {
    const { scene, cubeEntityId } = createSampleScene();
    const graph = createSampleNodeGraph();
    const rotateNode = graph.nodes.find((n) => n.typeId === 'entity.rotateY');
    if (rotateNode) rotateNode.data = { entityId: cubeEntityId };

    const executor = new NodeGraphExecutor(graph);
    const before = scene.world.getTransform(cubeEntityId)!.rotation.yDeg;

    executor.runOnTick({
      scene,
      dt: 0.05,
      tick: 1,
      log: () => {},
    });

    expect(scene.world.getTransform(cubeEntityId)!.rotation.yDeg).not.toBe(before);
  });
});
