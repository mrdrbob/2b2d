import { Handle } from "../Asset";
import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Component from "../Component";
import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import UseSpriteRenderer from '../Components/UseSpriteRenderer';
import { Layer } from "../Layer";
import Update from "../Update";
import BufferFiller from "../Utils/BufferFiller";
import { QueryResult } from "../World";
import AbstractRenderer from "./AbstractRenderer";
import RenderingSystem from "./RenderingSystem";
import wgsl from './Shaders/Sprite.wgsl?raw';

// Most sprites that can be on a single layer with the same texture
const MAX_SPRITES_PER_BATCH = 1024;

export class SpriteRenderer extends AbstractRenderer {
  name = 'RenderSprites';

  module!: GPUShaderModule;
  sharedBindGroupLayout!: GPUBindGroupLayout;
  sharedBindGroup!: GPUBindGroup;
  batchBindGroupLayout!: GPUBindGroupLayout;
  pipelineLayout!: GPUPipelineLayout;
  pipeline!: GPURenderPipeline;

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

    // Batch-specific group layout. (binding happens later per batch)
    this.batchBindGroupLayout = this.parent.device.createBindGroupLayout({
      label: `${this.name} batch bind group layout`,
      entries: this.getBatchBindGroupLayoutEntries()
    });

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
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Texture
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }, // Sprites
    ];
  }

  protected getPipelineGroupLayoutEntries(): GPUBindGroupLayout[] {
    return [
      this.sharedBindGroupLayout,
      this.batchBindGroupLayout
    ];
  }

  bindGroupCache = new Map<Handle, [GPUBindGroup, GPUBuffer, Float32Array]>();
  frameBatch = new Map<Layer, Array<{ group: GPUBindGroup, count: number }>>();

  beginFrame(update: Update): void {
    const assets = update.assets();

    // Clear the current frame batch.
    this.frameBatch.clear();

    // Now pull renderable instances and sort for frame.
    const renderableEntities = update.query([Sprite.NAME, Position.NAME, UseSpriteRenderer]);

    // Going to sort these then turn into bind groups
    var sorting = new Map<Layer, Map<Handle, Array<QueryResult>>>();

    // Iterate to sort into rendering buckets.
    // We need to sort into layers, and then by texture.
    // Each texture will be batched so all instances of that texture (on that layer)
    // are drawn in a single draw call.
    for (const entity of renderableEntities) {
      const components = entity.components as [Sprite, Position, Component];

      const [sprite, _position, _rendering] = components;

      let textureSort = sorting.get(sprite.layer);
      if (!textureSort) {
        textureSort = new Map<Handle, Array<QueryResult>>();
        sorting.set(sprite.layer, textureSort);
      }

      let instancesForTexture = textureSort.get(sprite.texture);
      if (!instancesForTexture) {
        instancesForTexture = new Array<QueryResult>();
        textureSort.set(sprite.texture, instancesForTexture);
      }

      instancesForTexture.push(entity);
    }

    // Now that we've sorted, going to put these into an arrays
    // for rendering
    for (const [layer, textureSort] of sorting) {
      const layerBatches = new Array<{ group: GPUBindGroup, count: number }>();

      for (const [texture, components] of textureSort) {

        let bindGroup = this.bindGroupCache.get(texture);
        if (!bindGroup) {
          // Instance buffers is made up 7 Vec2s:
          // pos, size, rg, ba, scale, atlasPos, rot
          const buffer = new Float32Array(MAX_SPRITES_PER_BATCH * 7 * 2);
          const gpuBuffer = this.parent.device.createBuffer({
            label: `sprite instance buffer ${texture}`,
            size: buffer.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
          });

          const gpuTexture = this.ensureTextureLoadedToGpu(assets, texture);

          const createdBindGroup = this.parent.device.createBindGroup({
            label: `Srite batch bind group ${texture}`,
            layout: this.batchBindGroupLayout,
            entries: [
              { binding: 0, resource: gpuTexture }, // Texture
              { binding: 1, resource: { buffer: gpuBuffer } }, // Instances
            ]
          });

          bindGroup = [createdBindGroup, gpuBuffer, buffer];
          this.bindGroupCache.set(texture, bindGroup);
        }

        // Now fill the buffers
        const [grp, gpuBuffer, buffer] = bindGroup;
        const builder = new BufferFiller(buffer);

        // Add each instance to the buffer
        for (const comp of components) {
          const [sprite, position, _rendering] = comp.components as [Sprite, Position, Component];
          const atlas = assets.assume<SpriteAtlas>(sprite.atlas);

          const pos = update.resolvePosition(comp.entity, position);
          const frame = atlas.frames[sprite.frame];


          builder.push(pos);
          builder.push([frame.frame.w, frame.frame.h]);
          builder.push(sprite.color.array());
          builder.push(sprite.scale);
          builder.push([frame.frame.x, frame.frame.y]);

          builder.push([Math.cos(sprite.radians), Math.sin(sprite.radians)]);
        }

        this.parent.device.queue.writeBuffer(gpuBuffer, 0, buffer, 0, builder.offset * Float32Array.BYTES_PER_ELEMENT)

        // Add to the batch for this layer
        layerBatches.push({ group: grp, count: components.length });
      }

      this.frameBatch.set(layer, layerBatches);
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
      passEncoder.setBindGroup(1, bindGroup.group);
      passEncoder.draw(6, bindGroup.count);
    }
  }

  endFrame(): void { }

  cleanup(): void {
    // TODO: Clean up buffers and textures
  }
}

export default function RenderSprites(system: RenderingSystem) {
  var renderer = new SpriteRenderer(system);
  renderer.initialize();
  return renderer;
}