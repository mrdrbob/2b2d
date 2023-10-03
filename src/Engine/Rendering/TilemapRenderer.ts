import { TilemapData } from "../Assets/TilemapAsset";
import Position from "../Components/Position";
import Tilemap from "../Components/Tilemap";
import { Entity } from "../Entity";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";
import wgsl from './Shaders/Tilemap.wgsl?raw';

interface LoadedTilemap {
  sourceTexture: GPUTexture,
  atlasTexture: GPUTexture,
  tileSize: Vec2,
  fullSize: Vec2,
}

interface TilemapInstance {
  name: string,
  pos: Vec2,
  tilemap: LoadedTilemap,
  bufferValues: Float32Array,
  buffer: GPUBuffer,
}

export default class TilemapRenderer implements Renderer {
  parent!: RenderingSystem;
  sharedBindGroup!: GPUBindGroup;
  specificBindGroupLayout!: GPUBindGroupLayout;
  pipeline!: GPURenderPipeline;

  async initialize(parent: RenderingSystem) {
    this.parent = parent;
    
    const module = parent.device.createShaderModule({
      label: 'tilemap module',
      code: wgsl
    });

    const sharedBindGroupLayout = parent.device.createBindGroupLayout({
      label: 'tilemap shared bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // world
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // frame
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} }, // sampler
      ]
    });

    this.sharedBindGroup = parent.device.createBindGroup({
      label: 'tilemap shared bind group',
      layout: sharedBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: parent.worldUniformBuffer } },
        { binding: 1, resource: { buffer: this.parent.frameUniformBuffer } },
        { binding: 2, resource: this.parent.sampler },
      ]
    });

    // Texture specific bind group
    this.specificBindGroupLayout = parent.device.createBindGroupLayout({
      label: 'tilemap specific bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }, // quad
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'uint' } }, // atlas texture
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // source texture
      ]
    });

    const pipelineLayout = parent.device.createPipelineLayout({
      label: 'tilemap pipeline',
      bindGroupLayouts: [
        sharedBindGroupLayout,
        this.specificBindGroupLayout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: 'tilemap pipeline',
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

  private loadedTilemaps:Map<string, LoadedTilemap> = new Map<string, LoadedTilemap>();
  private instances:Map<Entity, TilemapInstance> = new Map<Entity, TilemapInstance>;
  beginFrame(): void {
    this.instances.clear();
  }

  draw(update: Update, layer: string): void {
    var query = update.queryCached('TilemapRendererDraw', [ Tilemap.NAME, Position.NAME ]);
    var assets = update.resource<AssetsResource>(AssetsResource.NAME);

    for (const entity of query) {
      const [sprite, position] = entity.components as [Tilemap, Position];
      if (sprite.layer != layer)
        continue;

      let tilemap = this.loadedTilemaps.get(sprite.tilemap);
      if (!tilemap) {
        const data = assets.assume<TilemapData>(sprite.tilemap);
        const atlasTexture = this.createAtlasTexture(sprite.tilemap, data);
        const sourceTexture = this.parent.ensureTextureLoaded(sprite.texture, assets);

        tilemap = {
          atlasTexture,
          sourceTexture,
          tileSize: data.tileSize,
          fullSize: data.mapTileCount.multiply(data.tileSize)
        };

        this.loadedTilemaps.set(sprite.tilemap, tilemap);
      }

      let instance = this.instances.get(entity.entity);
      if (!instance) {
        const quadBufferValues = new Float32Array(6); // 2 values each: pos, fullSize, tileSize
        const quadBuffer = this.parent.device.createBuffer({
          label: `tilemap quad buffer ${sprite.tilemap}`,
          size: quadBufferValues.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        instance = {
          name: sprite.tilemap,
          pos: position.globalPosition(),
          tilemap,
          buffer: quadBuffer,
          bufferValues: quadBufferValues
        };

        this.instances.set(entity.entity, instance);
      }

      const pos = position.globalPosition();
      instance.bufferValues.set([
        pos.x, pos.y,
        tilemap.fullSize.x, tilemap.fullSize.y,
        tilemap.tileSize.x, tilemap.tileSize.y,
      ], 0);
      this.parent.device.queue.writeBuffer(instance.buffer, 0, instance.bufferValues, 0);
    }
  }

  endFrame(passEncoder: GPURenderPassEncoder): void {
    if (this.instances.size == 0)
      return;
    
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.sharedBindGroup);
  
    for (const instance of this.instances.values()) {
      const batchBindGroup = this.parent.device.createBindGroup({
        label: `tilemap batch bind group ${instance.name}`,
        layout: this.specificBindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: instance.buffer } }, // Quad
          { binding: 1, resource: instance.tilemap.atlasTexture.createView() }, // Atlas
          { binding: 2, resource: instance.tilemap.sourceTexture.createView() }, // Source 
        ]
      });

      passEncoder.setBindGroup(1, batchBindGroup);
      passEncoder.draw(6);
    }
  }

  createAtlasTexture(name:string, tilemap:TilemapData) {
    const atlasTexture = this.parent.device.createTexture({
      label: `atlas texture ${name}`,
      format: 'rg32uint',
      size: [tilemap.mapTileCount.x, tilemap.mapTileCount.y],
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.parent.device.queue.writeTexture(
      { texture: atlasTexture },
      tilemap.data,
      { bytesPerRow: tilemap.mapTileCount.x * 4 * 2, rowsPerImage: tilemap.mapTileCount.y },
      { width: tilemap.mapTileCount.x, height: tilemap.mapTileCount.y }
    );
    return atlasTexture;
  }
}