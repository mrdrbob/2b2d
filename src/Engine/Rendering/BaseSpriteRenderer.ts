import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Component from "../Component";
import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";

const MAX_SPRITES:number = 1000;
const VALUES_PER_SPRITE:number = 12; // 2 values each: pos, size, rg, ba, scale, atlasPos

export interface RenderBatch {
  texture: GPUTexture,
  gpuBuffer: GPUBuffer,
  bufferValues: Float32Array,
  count: number,
}

export default abstract class BaseSpriteRenderer<T extends RenderBatch> implements Renderer  {
  abstract name():string;

  abstract getWgsl():string;

  parent!: RenderingSystem;
  module!: GPUShaderModule;
  sharedBindGroupLayout!: GPUBindGroupLayout;
  sharedBindGroup!: GPUBindGroup;
  batchBindGroupLayout!: GPUBindGroupLayout;
  pipelineLayout!: GPUPipelineLayout;
  pipeline!: GPURenderPipeline;

  batches: Map<string, T> = new Map<string, T>();

  protected createModule() {
    return this.parent.device.createShaderModule({
      label: 'sprite renderer',
      code: this.getWgsl()
    });
  }

  protected getSharedBindGroupLayoutEntries() : GPUBindGroupLayoutEntry[] {
    return [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // World
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // Frame
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} }, // Sampler
    ];
  }

  protected getSharedBindGroupEntries(): GPUBindGroupEntry[] {
    return [
      { binding: 0, resource: { buffer: this.parent.worldUniformBuffer } },
      { binding: 1, resource: { buffer: this.parent.frameUniformBuffer } },
      { binding: 2, resource: this.parent.sampler },
    ];
  }

  protected getBatchBindGroupLayoutEntries() : GPUBindGroupLayoutEntry[] {
    return [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Texture
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }, // Sprites
    ];
  }

  protected getBatchBindGroupEntries(batch:T) : GPUBindGroupEntry[] {
    return [
      { binding: 0, resource: batch.texture.createView() },
      { binding: 1, resource: { buffer: batch.gpuBuffer } },
    ]
  }

  protected getPipelineGroupLayoutEntries() : GPUBindGroupLayout[] {
    return [
      this.sharedBindGroupLayout,
      this.batchBindGroupLayout
    ];
  }

  async initialize(parent: RenderingSystem) {
    this.parent = parent;

    this.module = this.createModule();

    this.sharedBindGroupLayout = parent.device.createBindGroupLayout({
      label: `${this.name()} shared bind group layout`,
      entries: this.getSharedBindGroupLayoutEntries()
    });

    this.batchBindGroupLayout = parent.device.createBindGroupLayout({
      label: `${this.name()} batch bind group layout`,
      entries: this.getBatchBindGroupLayoutEntries()
    });

    this.sharedBindGroup = parent.device.createBindGroup({
      label: 'sprite shared bind group',
      layout: this.sharedBindGroupLayout,
      entries: this.getSharedBindGroupEntries()
    });

    this.pipelineLayout = parent.device.createPipelineLayout({
      label: `${this.name()} pipeline layout`,
      bindGroupLayouts: this.getPipelineGroupLayoutEntries()
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: `${this.name()} pipeline`,
      layout: this.pipelineLayout,
      vertex: {
        module: this.module,
        entryPoint: 'vs',
        buffers: [ this.parent.vertexBufferLayout ]
      },
      fragment: {
        module: this.module,
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

  beginFrame(): void {
    this.batches.clear();
  }

  protected queryForData(update: Update) {
    return update.queryCached('SpriteRendererDraw', [ Sprite.NAME, Position.NAME ]);
  }

  protected getSpiteData(layer: string,  entity:{ entity: number, components: Component[] }) { 
    const [sprite, position] = entity.components as [Sprite, Position];
    if (sprite.layer != layer)
      return null;

    if (!sprite.useDefaultRenderer)
      return null;

    const pos = position.globalPosition();

    return {
      pos,
      atlas: sprite.atlas,
      frame: sprite.frame,
      texture: sprite.texture,
      scale: sprite.scale,
      color: sprite.color,
    };
  }

  protected getBatch(sprite:{ texture:string }, layer:string, assets:AssetsResource) {
    const texture = this.parent.ensureTextureLoaded(sprite.texture, assets);

    const spriteBufferValues = new Float32Array(MAX_SPRITES * VALUES_PER_SPRITE);
    const spriteBuffer = this.parent.device.createBuffer({
      label: `${this.name()} - ${sprite.texture}:${layer} sprite buffer`,
      size: MAX_SPRITES * VALUES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    return this.createBatch(texture, spriteBuffer, spriteBufferValues, 0);
  }

  protected abstract createBatch(texture: GPUTexture, gpuBuffer: GPUBuffer, bufferValues: Float32Array, count: number):T;

  draw(update: Update, layer: string): void {
    const assets = update.resource<AssetsResource>(AssetsResource.NAME);
    const query = this.queryForData(update);

    for (const entity of query) {
      const sprite = this.getSpiteData(layer, entity);
      if (sprite == null)
        continue;

      const atlas = assets.assume<SpriteAtlas>(sprite.atlas);
      const frame = atlas.frames[sprite.frame];
      const atlasPos = new Vec2(frame.frame.x, frame.frame.y);
      const size = new Vec2(frame.frame.w, frame.frame.h);
      
      let batchName = `${layer}:${sprite.texture}`;
      let batch = this.batches.get(batchName);

      if (!batch) {
        batch = this.getBatch(sprite, layer, assets);
        this.batches.set(batchName, batch);
      }

      batch.bufferValues.set([
        sprite.pos.x, sprite.pos.y,
        size.x, size.y,
        sprite.color[0], sprite.color[1],
        sprite.color[2], sprite.color[3],
        sprite.scale.x, sprite.scale.y,
        atlasPos.x, atlasPos.y
      ], batch.count * VALUES_PER_SPRITE);
      batch.count += 1;
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
      this.parent.device.queue.writeBuffer(batch.gpuBuffer, 0, batch.bufferValues, 0, batch.count * VALUES_PER_SPRITE);
      
      const batchBindGroup = this.parent.device.createBindGroup({
        label: `${this.name()} batch bind group ${key}`,
        layout: this.batchBindGroupLayout,
        entries: this.getBatchBindGroupEntries(batch),
      });

      passEncoder.setBindGroup(1, batchBindGroup);
      passEncoder.draw(6, batch.count);
    }
  }

} 
