import Gradient from "../Components/Gradient";
import Position from "../Components/Position";
import { Layer } from "../Layer";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import BufferFiller from "../Utils/BufferFiller";
import Renderer from "./Renderer";
import RenderingSystem from "./RenderingSystem";
import wgsl from './Shaders/Gradient.wgsl?raw';

// The Vertex buffer will be made up of 5 Vec2 values repeating:
//   @location(0) vertex: vec2f,    // The offset (-1..1)
//   @location(1) rg: vec2f,        // Red / Green color
//   @location(2) ba: vec2f,        // Blue / Green component
//   @location(3) grad_size:vec2f,  // Size of the entire gradient
//   @location(4) grad_pos:vec2f,   // Position in space
const VERTEX_PER_INSTANCE = 6; // Two triangles
const VECS_PER_VERTEX = 5; // Each vertex of each triangle has 5 Vec2 values
const VALUES_PER_VEC2 = 2; // Obviously a Vec2 has 2 values, but this makes the `* 2` more obvious in code.

const NORTH = -0.5;
const SOUTH = 0.5;
const WEST = -0.5;
const EAST = 0.5;

const MAX_GRADIENTS = 256;

function createVetexBufferLayout(): GPUVertexBufferLayout {
  const attrs = new Array<GPUVertexAttribute>();
  for (let x = 0; x < VECS_PER_VERTEX; x++) {
    attrs.push({
      shaderLocation: x,
      offset: (VALUES_PER_VEC2 * x) * Float32Array.BYTES_PER_ELEMENT,
      format: 'float32x2'
    });
  }

  return {
    arrayStride: Float32Array.BYTES_PER_ELEMENT * VECS_PER_VERTEX * VALUES_PER_VEC2,
    attributes: attrs
  };
}

export interface GradientData {
  position: Vec2,
  size: Vec2,
  colors: {
    nw: Color,
    ne: Color,
    sw: Color,
    se: Color,
  }
}

export interface Batch {
  count: number,
  offset: number
}

export class GradientRenderer implements Renderer {
  name = 'RenderGradients';
  sharedBindGroup!: GPUBindGroup;
  pipeline!: GPURenderPipeline;
  vertexBuffer!: Float32Array;
  vertexGpuBuffer!: GPUBuffer;

  constructor(public parent: RenderingSystem) {

  }

  initialize() {
    const module = this.parent.device.createShaderModule({
      label: 'gradient module',
      code: wgsl
    });

    // Shared for all rendering
    const sharedBindGroupLayout = this.parent.device.createBindGroupLayout({
      label: 'gradient shared bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // world
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // frame
      ]
    });

    this.sharedBindGroup = this.parent.device.createBindGroup({
      label: 'gradient shared bind group',
      layout: sharedBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.parent.worldUniformBuffer } },
        { binding: 1, resource: { buffer: this.parent.frameUniformBuffer } },
      ]
    });

    const pipelineLayout = this.parent.device.createPipelineLayout({
      label: 'gradient pipeline',
      bindGroupLayouts: [
        sharedBindGroupLayout
      ]
    });

    // Create the vertex buffer, which will be reused.
    this.vertexBuffer = new Float32Array(MAX_GRADIENTS * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2);
    this.vertexGpuBuffer = this.parent.device.createBuffer({
      size: this.vertexBuffer.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.pipeline = this.parent.device.createRenderPipeline({
      label: `gradient pipeline`,
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [createVetexBufferLayout()]
      },
      fragment: {
        module: module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.parent.presentationFormat,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: 'one-minus-src-alpha',
                operation: 'add'
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add'
              }
            },
            writeMask: GPUColorWrite.ALL
          }
        ],
      },
      primitive: { topology: 'triangle-list' }
    });
  }

  batches = new Map<Layer, Batch>();

  beginFrame(update: Update): void {
    this.batches.clear();

    const query = update.query([Gradient.NAME, Position.NAME]);
    if (query.length === 0)
      return;

    // First, we sort these into layers to draw.
    const layerBatches = new Map<Layer, GradientData[]>();
    for (const entity of query) {
      const [gradient, position] = entity.components as [Gradient, Position];
      const isVisible = update.resolveVisibility(entity.entity);
      if (!isVisible)
        continue;

      const pos = update.resolvePosition(entity.entity, position);

      const data: GradientData = {
        position: pos,
        size: gradient.size,
        colors: { nw: gradient.nw, ne: gradient.ne, sw: gradient.sw, se: gradient.se }
      };

      let layerSet = layerBatches.get(gradient.layer);
      if (!layerSet) {
        layerSet = new Array<GradientData>();
        layerBatches.set(gradient.layer, layerSet);
      }
      layerSet.push(data);
    }

    // Now we fill the vertex buffer with the values and store offset/count for rendering each layer.
    let builder = new BufferFiller(this.vertexBuffer);
    for (const [layer, data] of layerBatches) {
      const start = builder.offset;
      for (const grad of data) {
        // First triangle
        builder.push([WEST, SOUTH]);
        builder.push(grad.colors.sw.array());
        builder.push(grad.position);
        builder.push(grad.size);

        builder.push([EAST, NORTH]);
        builder.push(grad.colors.ne.array());
        builder.push(grad.position);
        builder.push(grad.size);

        builder.push([EAST, SOUTH]);
        builder.push(grad.colors.se.array());
        builder.push(grad.position);
        builder.push(grad.size);

        // Second triangle
        builder.push([WEST, SOUTH]);
        builder.push(grad.colors.sw.array());
        builder.push(grad.position);
        builder.push(grad.size);

        builder.push([WEST, NORTH]);
        builder.push(grad.colors.nw.array());
        builder.push(grad.position);
        builder.push(grad.size);

        builder.push([EAST, NORTH]);
        builder.push(grad.colors.ne.array());
        builder.push(grad.position);
        builder.push(grad.size);
      }

      this.batches.set(layer, { offset: start, count: data.length });
    }

    if (this.batches.size === 0)
      return;

    const size = builder.offset * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2;
    this.parent.device.queue.writeBuffer(this.vertexGpuBuffer, 0, this.vertexBuffer, 0, size);
  }

  drawLayer(passEncoder: GPURenderPassEncoder, layer: string): void {
    if (this.batches.size == 0)
      return;

    const batch = this.batches.get(layer);
    if (!batch || batch.count === 0)
      return;

    // Draw. The Vertex buffer already has all the data it needs.
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.sharedBindGroup);
    passEncoder.setVertexBuffer(0, this.vertexGpuBuffer,
      batch.offset * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2 * Float32Array.BYTES_PER_ELEMENT,
      batch.count * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2 * Float32Array.BYTES_PER_ELEMENT
    );
    passEncoder.draw(VERTEX_PER_INSTANCE * batch.count);
  }

  endFrame(): void {
  }

  cleanup(): void {
  }
}

export default function RenderGradients(system: RenderingSystem) {
  const renderer = new GradientRenderer(system);
  renderer.initialize();
  return renderer;
}