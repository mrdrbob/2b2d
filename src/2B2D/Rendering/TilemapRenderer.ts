import { TilemapData } from "../Assets/TilemapData";
import Position from "../Components/Position";
import Tilemap from "../Components/Tilemap";
import { Layer } from "../Layer";
import Update from "../Update";
import BufferFiller from "../Utils/BufferFiller";
import AbstractRenderer from "./AbstractRenderer";
import RenderingSystem from "./RenderingSystem";
import wgsl from './Shaders/Tliemap.wgsl?raw';

export class TilemapRenderer extends AbstractRenderer {

  name = "RenderTilemaps";
  module!: GPUShaderModule;
  sharedBindGroupLayout!: GPUBindGroupLayout;
  sharedBindGroup!: GPUBindGroup;
  batchBindGroupLayout!: GPUBindGroupLayout;
  pipelineLayout!: GPUPipelineLayout;
  pipeline!: GPURenderPipeline;

  checkGenerations = true;

  initialize() {
    this.module = this.createModule();

    // Shared bind group layout and binding
    this.sharedBindGroupLayout = this.parent.device.createBindGroupLayout({
      label: `${this.name} shared bind group layout`,
      entries: this.getSharedBindGroupLayoutEntries()
    });

    this.sharedBindGroup = this.parent.device.createBindGroup({
      label: `${this.name} shared bind group`,
      layout: this.sharedBindGroupLayout,
      entries: this.getSharedBindGroupEntries()
    });

    // Batch specific bind layout (bind happens later)
    this.batchBindGroupLayout = this.parent.device.createBindGroupLayout({
      label: `${this.name} batch bind group`,
      entries: this.getBatchBindGroupLayoutEntries()
    });

    // Now the pipeline layout and pipeline
    this.pipelineLayout = this.parent.device.createPipelineLayout({
      label: `${this.name} pipeline layout`,
      bindGroupLayouts: this.getPipelineGroupLayoutEntries()
    });

    this.pipeline = this.parent.device.createRenderPipeline({
      label: `${this.name} pipeline`,
      layout: this.pipelineLayout,
      vertex: {
        module: this.module,
        entryPoint: 'vs',
        buffers: [this.parent.vertexBufferLayout]
      },
      fragment: {
        module: this.module,
        entryPoint: 'fs',
        targets: this.getFragmentColorTargets(),
      },
      primitive: { topology: 'triangle-list' }
    });
  }

  protected createModule() {
    return this.parent.device.createShaderModule({
      label: `${this.name} module`,
      code: this.getWgsl()
    });
  }

  protected getWgsl() { return wgsl; }

  protected getBatchBindGroupLayoutEntries(): GPUBindGroupLayoutEntry[] {
    return [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }, // Quad details
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'uint' } }, // Atlas texture
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Source texture
    ];
  }

  protected getPipelineGroupLayoutEntries(): GPUBindGroupLayout[] {
    return [
      this.sharedBindGroupLayout,
      this.batchBindGroupLayout
    ];
  }

  // Will load texture atlas into the GPU and cache.
  ensureAtlasTexture(name: string, tilemap: TilemapData) {
    const cached = this.textureCache.get(name);
    if (cached)
      return cached;

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

    const view = atlasTexture.createView();
    this.textureCache.set(name, view);
    return view;
  }

  lastGeneration = '';
  bindGroupCache = new Map<string, [GPUBindGroup, GPUBuffer, Float32Array]>();
  frameBatch = new Map<Layer, Array<GPUBindGroup>>();

  beginFrame(update: Update): void {
    // First prep all the batch bind groups
    const assets = update.assets();
    const query = update.query([Tilemap.NAME, Position.NAME]);

    if (query.length === 0) {
      this.frameBatch.clear();
      return;
    }

    // Generation check. Biascally we "hash" all the values of the layers we may process.
    // We get their "generation" (it'll be up to systems to update this, but tilemaps don't 
    // change that often) and position, then sort that list and turn it into a string (lame, 
    // I know), then compare that to the last computed value. This saves us from calculating 
    // vertices that have not changed and writing them to the buffer again for no reason.
    // There are probably edge cases that break this (such as Tilemaps parented to anything),
    // so you can set `checkGenerations = false` on the Tilemap renderer.
    if (this.checkGenerations) {
      const nextGeneration = query.map(entity => {
        const [tilemap, position] = entity.components as [Tilemap, Position];
        return `${entity.entity}|${tilemap.generation}|${position.pos.x}|${position.pos.y}`
      });
      nextGeneration.sort();
      const thisGen = nextGeneration.join(',');
      if (thisGen === this.lastGeneration)
        return;
      this.lastGeneration = thisGen;
    }

    this.frameBatch.clear();

    for (const entity of query) {
      const [tilemap, position] = entity.components as [Tilemap, Position];
      const tileData = assets.assume<TilemapData>(tilemap.tilemap);
      const texture = this.ensureTextureLoadedToGpu(assets, tilemap.texture);
      const atlas = this.ensureAtlasTexture(tilemap.tilemap, tileData);

      const pos = update.resolvePosition(entity.entity, position);
      const key = `${entity.entity}|${tilemap.tilemap}`;

      let bindGroup = this.bindGroupCache.get(key);
      if (!bindGroup) {
        // Need to create this bind group

        // First create and fill the buffer
        const buffer = new BufferFiller(new Float32Array(3 * 2));
        buffer.push(pos);
        buffer.push(tileData.mapTileCount);
        buffer.push(tileData.tileSize);

        const gpuBuffer = this.parent.device.createBuffer({
          label: `tilemap quad buffer ${entity.entity}`,
          size: buffer.buffer.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.parent.device.queue.writeBuffer(gpuBuffer, 0, buffer.buffer);

        // Now create the group
        const batchBindGroup = this.parent.device.createBindGroup({
          label: `Tilemap batch bind group ${entity.entity}`,
          layout: this.batchBindGroupLayout,
          entries: [
            { binding: 0, resource: { buffer: gpuBuffer } }, // Quad
            { binding: 1, resource: atlas }, // Atlas
            { binding: 2, resource: texture }, // Source 
          ]
        });

        bindGroup = [batchBindGroup, gpuBuffer, buffer.buffer];
        this.bindGroupCache.set(key, bindGroup);
      }

      // TODO: Some way to update the bindgroup / buffer values if
      // something changes. Maybe a 'dirty' flag?

      let layerSet = this.frameBatch.get(tilemap.layer);
      if (!layerSet) {
        layerSet = new Array<GPUBindGroup>();
        this.frameBatch.set(tilemap.layer, layerSet);
      }
      layerSet.push(bindGroup[0]);
    }
  }

  drawLayer(passEncoder: GPURenderPassEncoder, layer: string): void {
    // Now set the pipeline and bind the groups that are used for all calls
    // There is stuff to draw, so let's draw it.    
    passEncoder.setPipeline(this.pipeline);

    // Bind the shared stuff.
    passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.sharedBindGroup);

    const data = this.frameBatch.get(layer);
    if (!data || data.length === 0)
      return;

    for (const bindGroup of data) {
      passEncoder.setBindGroup(1, bindGroup);
      passEncoder.draw(6);
    }
  }

  endFrame(): void {
  }

  cleanup(): void {
    // TODO: Texture caches?
  }

}

export default function RenderTilemaps(system: RenderingSystem) {
  const renderer = new TilemapRenderer(system);
  renderer.initialize();
  return renderer;
}