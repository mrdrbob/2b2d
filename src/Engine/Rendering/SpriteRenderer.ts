import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";
import wgsl from './Shaders/Sprite.wgsl?raw';

const MAX_SPRITES:number = 1000;
const VALUES_PER_SPRITE:number = 12; // 2 values each: pos, size, rg, ba, scale, atlasPos

interface SpriteBatch {
  texture: GPUTexture,
  spriteBuffer: GPUBuffer,
  spriteBufferValues: Float32Array,
  spriteCount: number,
}



export default class SpriteRenderer implements Renderer {
  parent!: RenderingSystem;
  sharedBindGroup!: GPUBindGroup;
  pipeline!: GPURenderPipeline;
  specificBindGroupLayout!: GPUBindGroupLayout;

  async initialize(parent: RenderingSystem) {
    this.parent = parent;
    
    const module = parent.device.createShaderModule({
      label: 'sprite renderer',
      code: wgsl
    });

    // Shared resources
    const sharedBindGroupLayout = parent.device.createBindGroupLayout({
      label: 'sprite shared bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // World
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // Frame
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} }, // Sampler
      ]
    });

    this.sharedBindGroup = parent.device.createBindGroup({
      label: 'sprite shared bind group',
      layout: sharedBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.parent.worldUniformBuffer } },
        { binding: 1, resource: { buffer: this.parent.frameUniformBuffer } },
        { binding: 2, resource: this.parent.sampler },
      ]
    });

    // Sprite-specific bind group
    this.specificBindGroupLayout = parent.device.createBindGroupLayout({
      label: 'sprite specific bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Texture
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }, // Sprites
      ]
    });

    const pipelineLayout = parent.device.createPipelineLayout({
      label: 'sprite pipeline',
      bindGroupLayouts: [
        sharedBindGroupLayout,
        this.specificBindGroupLayout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: `sprite pipeline`,
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [ this.parent.vertexBufferLayout ]
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
              alpha:{
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

  batches: Map<string, SpriteBatch> = new Map<string, SpriteBatch>();
  beginFrame(): void {
    this.batches.clear();
  }

  draw(update: Update, layer: string): void {
    var query = update.queryCached('SpriteRendererDraw', [ Sprite.NAME, Position.NAME ]);
    var assets = update.resource<AssetsResource>(AssetsResource.NAME);

    for (const entity of query) {
      const [sprite, position] = entity.components as [Sprite, Position];
      if (sprite.layer != layer)
        continue;

      const pos = position.globalPosition();
      const atlas = assets.assume<SpriteAtlas>(sprite.atlas);
      const frame = atlas.frames[sprite.frame];
      const atlasPos = new Vec2(frame.frame.x, frame.frame.y);
      const size = new Vec2(frame.frame.w, frame.frame.h);

      let batchName = `${layer}:${sprite.texture}`;
      let batch = this.batches.get(batchName);
      if (!batch) {
        const texture = this.parent.ensureTextureLoaded(sprite.texture, assets);

        const spriteBufferValues = new Float32Array(MAX_SPRITES * VALUES_PER_SPRITE);
        const spriteBuffer = this.parent.device.createBuffer({
          label: `sprite buffer`,
          size: MAX_SPRITES * VALUES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });
    
        batch = {
          texture: texture,
          spriteBuffer: spriteBuffer,
          spriteBufferValues: spriteBufferValues,
          spriteCount: 0,
        };

        this.batches.set(batchName, batch);
      }

      batch.spriteBufferValues.set([
        pos.x, pos.y,
        size.x, size.y,
        sprite.color[0], sprite.color[1],
        sprite.color[2], sprite.color[3],
        sprite.scale.x, sprite.scale.y,
        atlasPos.x, atlasPos.y
      ], batch.spriteCount * VALUES_PER_SPRITE);
      batch.spriteCount += 1;
    }
  }

  endFrame(passEncoder: GPURenderPassEncoder): void {
    if (this.batches.size == 0)
      return;
      
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.sharedBindGroup);

    for (const key of this.batches.keys()) {
      const batch = this.batches.get(key)!;
      this.parent.device.queue.writeBuffer(batch.spriteBuffer, 0, batch.spriteBufferValues, 0, batch.spriteCount * VALUES_PER_SPRITE);
      
      const batchBindGroup = this.parent.device.createBindGroup({
        label: `sprite specific bind group ${key}`,
        layout: this.specificBindGroupLayout,
        entries: [
          { binding: 0, resource: batch.texture.createView() },
          { binding: 1, resource: { buffer: batch.spriteBuffer } },
        ]
      });

      passEncoder.setBindGroup(1, batchBindGroup);
      passEncoder.draw(6, batch.spriteCount);
    }
  }

  submitted() {
  }
}