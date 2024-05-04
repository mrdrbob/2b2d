import TextureAsset from "../../Assets/TextureAsset";
import Position from "../../Components/Position";
import Sprite from "../../Components/Sprite";
import Update from "../../Update";
import GpuTextureCache from "../GpuTextureCache";
import Renderer from "../Renderer";
import RenderingSystem from "../RenderingSystem";
import wgsl from './Sprite.wgsl?raw';
import SpriteBindGroup from "./SpriteBindGroup";

const DEFAULT_LAYER = 'SPRITE_DEFAULT_LAYER';

export default class SpriteRenderer implements Renderer {
  static readonly NAME: string = 'SpriteRenderer';
  readonly name: string = SpriteRenderer.NAME;
  bindGroup: SpriteBindGroup;
  textureCache: GpuTextureCache;
  pipeline: GPURenderPipeline;

  static create(parent: RenderingSystem) { return new SpriteRenderer(parent); }

  constructor(public parent: RenderingSystem) {
    this.textureCache = new GpuTextureCache(parent.device);

    const module = this.parent.device.createShaderModule({
      label: 'sprite module',
      code: wgsl
    });

    this.bindGroup = new SpriteBindGroup(this.parent.device);

    const pipelineLayout = this.parent.device.createPipelineLayout({
      label: 'sprite pipeline',
      bindGroupLayouts: [
        parent.globalBindGroup.layout,
        this.bindGroup.layout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: 'sprite pipeline',
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [this.parent.quadBuffer.layout]
      },
      fragment: {
        module: module,
        entryPoint: 'fs',
        targets: this.parent.colorTagets,
      },
      depthStencil: this.parent.depthStencil.state,
      primitive: this.parent.primitiveState
    });
  }

  prepare(update: Update): void {
    const assets = update.assets();

    // Batch all the sprites
    const query = update.ecs.query(Sprite, Position);
    if (query.length == 0)
      return;

    for (const entity of query) {
      const visible = update.resolve.visibility(entity.entity);
      if (!visible)
        continue;

      const [sprite, position] = entity.components;
      const pos = update.resolve.position(entity.entity, position).roundTens();

      const texture = assets.try<TextureAsset>(sprite.handle);
      if (!texture)
        continue;

      const frame = texture.atlas.frames[sprite.frame];
      if (!frame)
        continue;

      const order = update.resolve.renderOrder(entity.entity) || DEFAULT_LAYER;

      const depth = update.resolve.depth(entity.entity);

      const view = this.textureCache.ensure(texture.handle, texture.texture);
      const batch = this.bindGroup.batch(order, sprite, view);
      batch.push(sprite, pos, depth, frame);
    }
  }

  draw(layer: string | undefined, passEncoder: GPURenderPassEncoder): void {
    const layerBatch = this.bindGroup.batches.get(layer || DEFAULT_LAYER);
    if (!layerBatch || layerBatch.size == 0)
      return;

    // Now draw
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.parent.globalBindGroup.group);
    passEncoder.setVertexBuffer(0, this.parent.quadBuffer.buffer);

    for (const batch of layerBatch.values()) {
      if (batch.count === 0)
        continue;

      batch.writeToGPU();

      passEncoder.setBindGroup(1, batch.bindGroup);
      passEncoder.draw(6, batch.count);

      batch.reset();
    }
  }

  cleanup(): void {
    this.bindGroup.cleanup();
    this.textureCache.cleanup();
  }
}