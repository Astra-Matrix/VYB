import type { VybScene } from '../../scene';
import type {
  ViewportFrameStats,
  ViewportLightingMode,
  ViewportPreviewMode,
  ViewportRenderer,
} from '../renderInterfaces';
import {
  mat4FromTranslationRotationScale,
  mat4Identity,
  mat4LookAt,
  mat4Multiply,
  mat4Ortho,
  mat4Perspective,
  type Mat4,
} from '../math/mat4';
import { buildGridLineVertices, UNIT_CUBE_INDICES, UNIT_CUBE_VERTICES } from './geometry';
import { GRID_SHADER_WGSL, MESH_SHADER_WGSL } from './shaders';
import { WebGpuRenderDevice } from './WebGpuRenderDevice';

const MESH_UNIFORM_SIZE = 256;
const GRID_UNIFORM_SIZE = 80;

export class WebGpuViewportRenderer implements ViewportRenderer {
  readonly backendId = 'webgpu' as const;

  private context: GPUCanvasContext | null = null;
  private renderDevice: WebGpuRenderDevice | null = null;
  private depthTexture: GPUTexture | null = null;
  private meshPipeline: GPURenderPipeline | null = null;
  private gridPipeline: GPURenderPipeline | null = null;
  private meshUniformBuffer: GPUBuffer | null = null;
  private gridUniformBuffer: GPUBuffer | null = null;
  private meshBindGroup: GPUBindGroup | null = null;
  private gridBindGroup: GPUBindGroup | null = null;
  private cubeVertexBuffer: GPUBuffer | null = null;
  private cubeIndexBuffer: GPUBuffer | null = null;
  private gridVertexBuffer: GPUBuffer | null = null;
  private gridVertexCount = 0;

  private width = 1;
  private height = 1;
  private scene?: VybScene;
  private cameraMode: 'perspective' | 'orthographic' = 'perspective';
  private gridEnabled = true;
  private lightingMode: ViewportLightingMode = 'lit';
  private previewMode: ViewportPreviewMode = 'shaded';
  private raf?: number;
  private initialized = false;

  private frameMs = 0;
  private fps = 0;
  private drawCalls = 0;
  private lastFrameAt = performance.now();
  private fpsAccum = 0;
  private fpsFrames = 0;

  private readonly viewProjection = mat4Identity();
  private readonly meshUniformScratch = new Float32Array(MESH_UNIFORM_SIZE / 4);

  constructor(private readonly canvas: HTMLCanvasElement) {}

  async initialize(): Promise<void> {
    const ctx = this.canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!ctx) throw new Error('Failed to acquire WebGPU canvas context.');

    this.renderDevice = await WebGpuRenderDevice.create();
    const { device, format } = this.renderDevice;

    this.context = ctx;
    ctx.configure({ device, format, alphaMode: 'premultiplied' });

    this.meshUniformBuffer = device.createBuffer({
      size: MESH_UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.gridUniformBuffer = device.createBuffer({
      size: GRID_UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const meshModule = device.createShaderModule({ code: MESH_SHADER_WGSL });
    const gridModule = device.createShaderModule({ code: GRID_SHADER_WGSL });

    const meshBindGroupLayout = device.createBindGroupLayout({
      entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }],
    });
    const gridBindGroupLayout = device.createBindGroupLayout({
      entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }],
    });

    this.meshBindGroup = device.createBindGroup({
      layout: meshBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.meshUniformBuffer } }],
    });
    this.gridBindGroup = device.createBindGroup({
      layout: gridBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.gridUniformBuffer } }],
    });

    const meshPipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [meshBindGroupLayout] });
    const gridPipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [gridBindGroupLayout] });

    this.meshPipeline = device.createRenderPipeline({
      layout: meshPipelineLayout,
      vertex: {
        module: meshModule,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x3' },
            ],
          },
        ],
      },
      fragment: {
        module: meshModule,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
    });

    this.gridPipeline = device.createRenderPipeline({
      layout: gridPipelineLayout,
      vertex: {
        module: gridModule,
        entryPoint: 'vs_main',
        buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }],
      },
      fragment: {
        module: gridModule,
        entryPoint: 'fs_main',
        targets: [{ format, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }],
      },
      primitive: { topology: 'line-list' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'less-equal' },
    });

    this.cubeVertexBuffer = device.createBuffer({
      size: UNIT_CUBE_VERTICES.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.cubeVertexBuffer, 0, UNIT_CUBE_VERTICES);

    this.cubeIndexBuffer = device.createBuffer({
      size: UNIT_CUBE_INDICES.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.cubeIndexBuffer, 0, UNIT_CUBE_INDICES);

    const gridVerts = buildGridLineVertices(40, 1);
    this.gridVertexCount = gridVerts.length / 3;
    this.gridVertexBuffer = device.createBuffer({
      size: gridVerts.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.gridVertexBuffer, 0, gridVerts.buffer, gridVerts.byteOffset, gridVerts.byteLength);

    this.initialized = true;
  }

  setViewportSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(this.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * dpr));
    this.ensureDepthTexture();
  }

  setScene(scene: VybScene): void {
    this.scene = scene;
  }

  setCameraMode(mode: 'perspective' | 'orthographic'): void {
    this.cameraMode = mode;
  }

  setGridEnabled(enabled: boolean): void {
    this.gridEnabled = enabled;
  }

  setLightingMode(mode: ViewportLightingMode): void {
    this.lightingMode = mode;
  }

  setPreviewMode(mode: ViewportPreviewMode): void {
    this.previewMode = mode;
  }

  getFrameStats(): ViewportFrameStats | null {
    if (!this.initialized) return null;
    return { fps: this.fps, frameMs: this.frameMs, backend: 'webgpu', drawCalls: this.drawCalls };
  }

  renderFrame(): void {
    if (!this.initialized || !this.scene || !this.context || !this.renderDevice) return;

    const frameStart = performance.now();
    this.drawCalls = 0;

    const { device } = this.renderDevice;
    this.ensureDepthTexture();

    const textureView = this.context.getCurrentTexture().createView();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.039, g: 0.043, b: 0.059, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture!.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    const { view, projection, cameraPos, lightDir, lightColor } = this.buildCameraAndLight();
    mat4Multiply(projection, view, this.viewProjection);

    if (this.gridEnabled && this.gridPipeline && this.gridBindGroup && this.gridVertexBuffer) {
      const gridUniform = new Float32Array(20);
      gridUniform.set(this.viewProjection, 0);
      gridUniform[16] = 0;
      device.queue.writeBuffer(this.gridUniformBuffer!, 0, gridUniform);
      pass.setPipeline(this.gridPipeline);
      pass.setBindGroup(0, this.gridBindGroup);
      pass.setVertexBuffer(0, this.gridVertexBuffer);
      pass.draw(this.gridVertexCount);
      this.drawCalls++;
    }

    if (this.meshPipeline && this.meshBindGroup && this.cubeVertexBuffer && this.cubeIndexBuffer) {
      pass.setPipeline(this.meshPipeline);
      pass.setBindGroup(0, this.meshBindGroup);
      pass.setVertexBuffer(0, this.cubeVertexBuffer);
      pass.setIndexBuffer(this.cubeIndexBuffer, 'uint16');

      const unlit = this.lightingMode === 'unlit' || this.previewMode === 'wireframe' ? 1 : 0;
      const wireTint = this.previewMode === 'wireframe' ? 1 : 0;

      const meshEntities = this.scene.world.getEntitiesWithComponent('meshRenderer');
      for (const entityId of meshEntities) {
        const mesh = this.scene.world.getComponent(entityId, 'meshRenderer');
        if (!mesh?.visible) continue;

        const world = this.computeWorldMatrix(entityId);
        if (!world) continue;

        this.writeMeshUniforms(world, unlit, wireTint, cameraPos, lightDir, lightColor);
        device.queue.writeBuffer(this.meshUniformBuffer!, 0, this.meshUniformScratch);
        pass.drawIndexed(UNIT_CUBE_INDICES.length);
        this.drawCalls++;
      }
    }

    pass.end();
    device.queue.submit([encoder.finish()]);

    const now = performance.now();
    this.frameMs = now - frameStart;
    this.fpsAccum += this.frameMs;
    this.fpsFrames++;
    if (now - this.lastFrameAt >= 500) {
      this.fps = Math.round((this.fpsFrames * 1000) / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      this.lastFrameAt = now;
    }
  }

  startLoop(): void {
    const tick = () => {
      this.renderFrame();
      this.raf = window.requestAnimationFrame(tick);
    };
    this.raf = window.requestAnimationFrame(tick);
  }

  stopLoop(): void {
    if (this.raf) window.cancelAnimationFrame(this.raf);
    this.raf = undefined;
  }

  destroy(): void {
    this.stopLoop();
    this.depthTexture?.destroy();
    this.depthTexture = null;
    this.meshUniformBuffer?.destroy();
    this.gridUniformBuffer?.destroy();
    this.cubeVertexBuffer?.destroy();
    this.cubeIndexBuffer?.destroy();
    this.gridVertexBuffer?.destroy();
    void this.renderDevice?.destroy();
    this.renderDevice = null;
    this.initialized = false;
  }

  private ensureDepthTexture(): void {
    if (!this.renderDevice) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.depthTexture && this.depthTexture.width === w && this.depthTexture.height === h) return;
    this.depthTexture?.destroy();
    this.depthTexture = this.renderDevice.device.createTexture({
      size: [w, h],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  private buildCameraAndLight(): {
    view: Mat4;
    projection: Mat4;
    cameraPos: [number, number, number];
    lightDir: [number, number, number];
    lightColor: [number, number, number, number];
  } {
    const aspect = this.width / this.height;
    const projection = mat4Identity();
    const view = mat4Identity();
    let cameraPos: [number, number, number] = [3, 2, 6];
    let lightDir: [number, number, number] = [-0.4, -1, -0.3];
    let lightColor: [number, number, number, number] = [1, 1, 1, 1.2];

    const camId = this.scene?.activeCameraEntityId;
    const camTransform = camId ? this.scene?.world.getTransform(camId) : undefined;
    const camComp = camId ? this.scene?.world.getComponent(camId, 'camera') : undefined;

    if (camTransform) {
      cameraPos = [camTransform.position.x, camTransform.position.y, camTransform.position.z];
      const target: [number, number, number] = [
        cameraPos[0] - Math.sin((camTransform.rotation.yDeg * Math.PI) / 180),
        cameraPos[1] - 0.15,
        cameraPos[2] - Math.cos((camTransform.rotation.yDeg * Math.PI) / 180),
      ];
      mat4LookAt(cameraPos, target, [0, 1, 0], view);
    } else {
      mat4LookAt(cameraPos, [0, 0.5, 0], [0, 1, 0], view);
    }

    const mode = this.cameraMode;
    const fov = camComp?.fovDegrees ?? 60;
    const near = camComp?.near ?? 0.1;
    const far = camComp?.far ?? 500;
    if (mode === 'orthographic') {
      const half = (camComp?.orthographicWidth ?? 12) / 2;
      const aspectFix = aspect > 1 ? aspect : 1;
      mat4Ortho(-half * aspectFix, half * aspectFix, -half, half, near, far, projection);
    } else {
      mat4Perspective((fov * Math.PI) / 180, aspect, near, far, projection);
    }

    const lights = this.scene?.world.getEntitiesWithComponent('light') ?? [];
    if (lights.length > 0) {
      const light = this.scene!.world.getComponent(lights[0], 'light');
      if (light) {
        lightColor = [light.color.x, light.color.y, light.color.z, light.intensity];
        const lt = this.scene!.world.getTransform(lights[0]);
        if (lt) {
          lightDir = [-lt.position.x, -lt.position.y - 1, -lt.position.z - 0.5];
        }
      }
    }

    return { view, projection, cameraPos, lightDir, lightColor };
  }

  private computeWorldMatrix(entityId: string): Mat4 | null {
    const transform = this.scene?.world.getTransform(entityId);
    if (!transform) return null;

    const local = mat4FromTranslationRotationScale(
      transform.position.x,
      transform.position.y,
      transform.position.z,
      transform.rotation.xDeg,
      transform.rotation.yDeg,
      transform.rotation.zDeg,
      transform.scale.x,
      transform.scale.y,
      transform.scale.z,
    );

    if (transform.parentEntityId) {
      const parent = this.computeWorldMatrix(transform.parentEntityId);
      if (parent) return mat4Multiply(parent, local, new Float32Array(16));
    }
    return local;
  }

  private writeMeshUniforms(
    model: Mat4,
    unlit: number,
    wireTint: number,
    cameraPos: [number, number, number],
    lightDir: [number, number, number],
    lightColor: [number, number, number, number],
  ): void {
    const u = this.meshUniformScratch;
    u.set(this.viewProjection, 0);
    u.set(model, 16);
    u[32] = lightDir[0];
    u[33] = lightDir[1];
    u[34] = lightDir[2];
    u[35] = 0;
    u[36] = lightColor[0];
    u[37] = lightColor[1];
    u[38] = lightColor[2];
    u[39] = lightColor[3];
    u[40] = cameraPos[0];
    u[41] = cameraPos[1];
    u[42] = cameraPos[2];
    u[43] = 1;
    u[44] = unlit;
    u[45] = wireTint;
    u[46] = 0;
    u[47] = 0;
  }
}
