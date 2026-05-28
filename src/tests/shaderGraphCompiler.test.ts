import { describe, expect, it } from 'vitest';
import { createSampleShaderGraph } from '../engine/visual-scripting/NodeGraphModel';
import { ShaderGraphCompiler } from '../engine/visual-scripting/ShaderGraphCompiler';

describe('ShaderGraphCompiler', () => {
  it('compiles sample shader graph to WGSL', () => {
    const graph = createSampleShaderGraph();
    const result = new ShaderGraphCompiler().compile(graph);
    expect(result.wgsl).toContain('@fragment');
    expect(result.surfaceColorExpression).toContain('vec3');
  });
});
