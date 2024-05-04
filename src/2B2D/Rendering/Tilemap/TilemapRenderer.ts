import { LevelsAsset } from "../../Assets/LevelsAsset";
import Position from "../../Components/Position";
import Tilemap from "../../Components/Tilemap";
import Vec2 from "../../Math/Vec2";
import Update from "../../Update";
import GpuTextureCache from "../GpuTextureCache";
import Renderer from "../Renderer";
import RenderingSystem from "../RenderingSystem";
import AtlasTextureCache from "./AtlasTextureCache";
import wgsl from './Tilemap.wgsl?raw';
import TilemapBindGroup from "./TilemapBindGroup";

const DEFAULT_LAYER = 'TILEMAP_DEFAULT_LAYER';

export default class TilemapRenderer implements Renderer {
  static readonly NAME: string = 'TilemapRenderer';
  readonly name: string = TilemapRenderer.NAME;
  textureCache: GpuTextureCache;
  atlasCache: AtlasTextureCache;
  tilemapBindGroup: TilemapBindGroup;
  pipeline: GPURenderPipeline;

  static create(parent: RenderingSystem) { return new TilemapRenderer(parent); }

  constructor(public parent: RenderingSystem) {
    this.textureCache = new GpuTextureCache(parent.device);
    this.atlasCache = new AtlasTextureCache(parent.device);
    this.tilemapBindGroup = new TilemapBindGroup(parent.device);

    const module = parent.device.createShaderModule({
      label: 'tilemap module',
      code: wgsl
    });

    const pipelineLayout = this.parent.device.createPipelineLayout({
      label: 'tilemap pipeline',
      bindGroupLayouts: [
        parent.globalBindGroup.layout,
        this.tilemapBindGroup.layout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: 'tilemap pipeline',
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

  draw(layer: string | undefined, passEncoder: GPURenderPassEncoder): void {
    const layerBatch = this.tilemapBindGroup.groupsToRender.get(layer || DEFAULT_LAYER);
    if (!layerBatch || layerBatch.length == 0)
      return;

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.parent.globalBindGroup.group);
    passEncoder.setVertexBuffer(0, this.parent.quadBuffer.buffer);

    for (const group of layerBatch) {
      passEncoder.setBindGroup(1, group.group, [group.count * this.tilemapBindGroup.stride]);
      passEncoder.draw(6, 1);
    }
  }

  prepare(update: Update) {
    this.tilemapBindGroup.reset();

    // Get all the tilemaps in the world and build out
    // bind groups for each frame.
    const assets = update.assets();
    const query = update.ecs.query(Tilemap, Position);
    for (const entity of query) {
      const visible = update.resolve.visibility(entity.entity);
      if (!visible)
        continue;

      const [tilemap, position] = entity.components;
      const pos = update.resolve.position(entity.entity, position).roundTens();

      const levels = assets.try<LevelsAsset>(tilemap.handle);
      if (!levels)
        continue;

      const level = levels.levels.get(tilemap.level);
      if (!level)
        continue;

      const layer = level.layers.get(tilemap.layer);
      if (!layer)
        continue;

      const texture = levels.textures.get(layer.texture);
      if (!texture)
        continue;

      if (tilemap.frame < 0 || tilemap.frame >= layer.frames.length)
        continue;

      const frame = layer.frames[tilemap.frame];

      const id = tilemap.id();

      const textureView = this.textureCache.ensure(layer.texture, texture);
      const atlasView = this.atlasCache.ensure(id, layer.size, frame.bitmap);

      const order = update.resolve.renderOrder(entity.entity) || DEFAULT_LAYER;

      const layerOffset = level.size.sub(layer.size.scalarMultiply(layer.gridSize)).multiply(Vec2.from(-0.5, 0.5, 1));
      const finalPos = pos.add(layerOffset);

      const depth = update.resolve.depth(entity.entity);

      this.tilemapBindGroup.push(entity.entity, tilemap.frame, order, textureView, atlasView, finalPos, depth, layer.size, layer.gridSize);
    }
  }

  cleanup(): void {
    this.textureCache.cleanup();
    this.atlasCache.cleanup();
    this.tilemapBindGroup.cleanup();
  }
}