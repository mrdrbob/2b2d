import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import { TilemapData } from "../Assets/TilemapAsset";
import Vec2 from "../Math/Vec2";
import CameraResource from "../Resources/CameraResource";
import TilemapRenderer from "./TilemapRenderer";
import wgsl from './TilemapRenderer.wgsl?raw';

export default class TilemapRendererPipeline {
  frameContextUniformBuffer!: GPUBuffer;
  vertexBindGroup!: GPUBindGroup;
  fragmentBindGroup!: GPUBindGroup;
  pipeline!: GPURenderPipeline;
  fragmentContextValues!: Float32Array;

  constructor(private parent:TilemapRenderer, private name:string) {

  }

  initialize(texture:GPUTexture, tilemap:TilemapData, atlas:SpriteAtlas) {
    const module = this.parent.parent.device.createShaderModule({
      label: `tilemap shader module ${this.name}`,
      code: wgsl
    });

    const vertexBindGroupLayout = this.parent.parent.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'uniform'
          }
        }
      ]
    });

    this.fragmentContextValues = new Float32Array([
      0, 0, // pos
      0, 0, // size
      0, 0, // camera
      0, 0, // texel
    ]);
    this.frameContextUniformBuffer = this.parent.parent.device.createBuffer({
      label: `tilemap context uniform ${this.name}`,
      size: this.fragmentContextValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.vertexBindGroup = this.parent.parent.device.createBindGroup({
      label: `tilemap vertex bind group ${this.name}`,
      layout: vertexBindGroupLayout,
      entries:[
        { binding: 0, resource: { buffer: this.frameContextUniformBuffer } }
      ]
    });


    const fragmentBindGroupLayout = this.parent.parent.device.createBindGroupLayout({
      label: `tilemap fragment bind group layout ${this.name}`,
      entries: [
        { // Tilemap texture
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'uint'
          }
        },
        { // Atlas texture
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {}
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {}
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" }
        }
      ]
    });

    const atlasTexture = this.parent.parent.device.createTexture({
      label: `atlas texture ${this.name}`,
      format: 'rg32uint',
      size: [tilemap.spriteTileCount.x, tilemap.spriteTileCount.y],
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.parent.parent.device.queue.writeTexture(
      { texture: atlasTexture },
      tilemap.data,
      { bytesPerRow: tilemap.mapTileCount.x * 4 * 2, rowsPerImage: tilemap.mapTileCount.y },
      { width: tilemap.mapTileCount.x, height: tilemap.mapTileCount.y }
    );

    const atlasSampler = this.parent.parent.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });

    const fullSourceSpriteSize = tilemap.spriteTileCount.multiply(tilemap.tileSize);
    const values = [
      fullSourceSpriteSize.x, fullSourceSpriteSize.y,
      tilemap.mapTileCount.x, tilemap.mapTileCount.y,
      tilemap.tileSize.x, tilemap.tileSize.y
    ];
    const contextArray = new Float32Array(values);
    const contextBuffer = this.parent.parent.device.createBuffer({
      label: `tilemap fragment context values buffer ${this.name}`,
      size: contextArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    // TODO: Do this where it makes sense
    this.parent.parent.device.queue.writeBuffer(contextBuffer, 0, contextArray);


    this.fragmentBindGroup = this.parent.parent.device.createBindGroup({
      label: `tilemap fragment bind group ${this.name}`,
      layout: fragmentBindGroupLayout,
      entries: [
        { binding: 0, resource: atlasTexture.createView() },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: atlasSampler },
        { binding: 3, resource: { buffer: contextBuffer }}
      ]
    });

    const pipelineLayout = this.parent.parent.device.createPipelineLayout({
      bindGroupLayouts: [
        vertexBindGroupLayout,
        fragmentBindGroupLayout
      ]
    });

    this.pipeline = this.parent.parent.device.createRenderPipeline({
      label: `tilemap pipeine ${this.name}`,
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [
          this.parent.vertexBufferLayout
        ]
      },
      fragment: {
        module: module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.parent.parent.presentationFormat,
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
        ]
      },
      primitive: { topology: 'triangle-list' }
    });
  }

  draw(pos:Vec2, size:Vec2, camera:Vec2, texel:Vec2) {
    this.fragmentContextValues.set([
      pos.x, pos.y,
      size.y, size.y,
      camera.x, camera.y,
      texel.x, texel.y
    ], 0);
  }

  endFrame(passEncoder: GPURenderPassEncoder, camera:CameraResource) {
    this.parent.parent.device.queue.writeBuffer(this.frameContextUniformBuffer, 0, this.fragmentContextValues, 0, 8);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.vertexBindGroup);
    passEncoder.setBindGroup(1, this.fragmentBindGroup);
    passEncoder.draw(6);
  }

}
