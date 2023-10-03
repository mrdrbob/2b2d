import Gradient from "../Components/Gradient";
import Position from "../Components/Position";
import { Entity } from "../Entity";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";
import wgsl from './Shaders/Gradient.wgsl?raw';

interface GradientBatch {
  vertexBuffer: GPUBuffer,
  vertexData: Float32Array,
}

const NORTH = -0.5;
const SOUTH = 0.5;
const WEST = -0.5;
const EAST = 0.5;

export default class GradientRenderer implements Renderer {
  parent!: RenderingSystem;
  vertexBufferLayout!: GPUVertexBufferLayout;
  pipeline!: GPURenderPipeline;
  sharedBindGroup!: GPUBindGroup;

  async initialize(parent: RenderingSystem) {
    this.parent = parent;

    const module = parent.device.createShaderModule({
      label: 'gradient module',
      code: wgsl
    });

    this.vertexBufferLayout = {
      arrayStride: Float32Array.BYTES_PER_ELEMENT * 6, // vertex, rg, ba
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float32x2'
        },
        {
          shaderLocation: 1,
          offset: 2 * Float32Array.BYTES_PER_ELEMENT,
          format: 'float32x2'
        },
        {
          shaderLocation: 2,
          offset: 4 * Float32Array.BYTES_PER_ELEMENT,
          format: 'float32x2'
        }
      ]
    };

    const sharedBindGroupLayout = parent.device.createBindGroupLayout({
      label: 'gradient shared bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // world
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // frame
      ]
    });

    this.sharedBindGroup = parent.device.createBindGroup({
      label: 'gradient shared bind group',
      layout: sharedBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: parent.worldUniformBuffer } },
        { binding: 1, resource: { buffer: parent.frameUniformBuffer } },
      ]
    });

    const pipelineLayout = parent.device.createPipelineLayout({
      label: 'gradient pipeline',
      bindGroupLayouts: [
        sharedBindGroupLayout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: `gradient pipeline`,
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [this.vertexBufferLayout]
      },
      fragment: {
        module: module,
        entryPoint: 'fs',
        targets: [
          {
            format: parent.presentationFormat,
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

  private pool: Map<Entity, GradientBatch> = new Map<Entity, GradientBatch>();
  private batches:Entity[] = [];

  beginFrame(): void {
    this.batches = [];
  }

  draw(update: Update, layer: string): void {
    var query = update.queryCached('GradientRendererDraw', [Gradient.NAME, Position.NAME]);

    for (const entity of query) {
      const [sprite, position] = entity.components as [Gradient, Position];
      if (sprite.layer != layer)
        continue;

      let batch = this.pool.get(entity.entity);
      if (!batch) {
        const vertexData = new Float32Array(6 * 6);
        const vertexBuffer = this.parent.device.createBuffer({
          size: vertexData.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        batch = {
          vertexBuffer,
          vertexData
        };

        this.pool.set(entity.entity, batch);
      }

      const globalPos = position.globalPosition();
      batch.vertexData.set([
        WEST * sprite.size.x + globalPos.x, SOUTH * sprite.size.y + globalPos.y,
        sprite.sw.r, sprite.sw.g,
        sprite.sw.b, sprite.sw.a,

        EAST * sprite.size.x + globalPos.x, NORTH * sprite.size.y + globalPos.y,
        sprite.ne.r, sprite.ne.g,
        sprite.ne.b, sprite.ne.a,

        EAST * sprite.size.x + globalPos.x, SOUTH * sprite.size.y + globalPos.y,
        sprite.se.r, sprite.se.g,
        sprite.se.b, sprite.se.a,

        // Second triangle
        WEST * sprite.size.x + globalPos.x, SOUTH * sprite.size.y + globalPos.y,
        sprite.sw.r, sprite.sw.g,
        sprite.sw.b, sprite.sw.a,

        WEST * sprite.size.x + globalPos.x, NORTH * sprite.size.y + globalPos.y,
        sprite.nw.r, sprite.nw.g,
        sprite.nw.b, sprite.nw.a,

        EAST * sprite.size.x + globalPos.x, NORTH * sprite.size.y + globalPos.y,
        sprite.ne.r, sprite.ne.g,
        sprite.ne.b, sprite.ne.a,
      ]);

      this.batches.push(entity.entity);
      this.parent.device.queue.writeBuffer(batch.vertexBuffer, 0, batch.vertexData);
    }
  }


  endFrame(passEncoder: GPURenderPassEncoder): void {
    passEncoder.setPipeline(this.pipeline);
    // passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.sharedBindGroup);

    for (const key of this.batches) {
      const batch = this.pool.get(key)!;

      passEncoder.setVertexBuffer(0, batch.vertexBuffer, 0);
      passEncoder.draw(6);
    }
  }

}
