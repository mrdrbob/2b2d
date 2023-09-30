import Vec2 from "../Math/Vec2";
import CameraResource from "../Resources/CameraResource";
import BaseSpriteRender from "./BaseSpriteRenderer";
import wgsl from './SpriteRenderer.wgsl?raw';

const MAX_SPRITES = 8 * 1024;

export default class SpriteRendererPipeline {
  private instanceArray:Float32Array = new Float32Array(MAX_SPRITES);
  private instanceArrayOffset = 0;
  private instanceCount = 0;

  public readonly parent: BaseSpriteRender;
  private readonly name: string;

  private pipeline!: GPURenderPipeline;
  private vertexBindGroup!: GPUBindGroup;
  private spriteInstanceBuffer!: GPUBuffer;
  private fragmentBindGroup!: GPUBindGroup;
  private frameContextValues!: Float32Array;
  private frameContextBuffer!: GPUBuffer;

  constructor(parent: BaseSpriteRender, name:string) {
    this.parent = parent;
    this.name = name;
  }

  initialize(texture:GPUTexture) {
    // Create the module with our shader code
    const module = this.parent.parent.device.createShaderModule({
      label: `sprite shader module ${this.name}`,
      code: wgsl,
    });

    // Define the layout for the bind group used for the vertex shader
    // Uses a "context" uniform for info about the world
    // And a sprite instance read storage for instances of sprites to render
    const spiteContextUniformLayout:GPUBindGroupLayoutEntry = {
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: {
        type: 'uniform'
      }
    };
    const spriteInstancesStorageLayout:GPUBindGroupLayoutEntry = {
      binding: 1,
      visibility: GPUShaderStage.VERTEX,
      buffer: {
        type: 'read-only-storage'
      }
    }
    const frameUniformLayout:GPUBindGroupLayoutEntry = {
      binding: 2,
      visibility: GPUShaderStage.VERTEX,
      buffer: {
        type: 'uniform'
      }
    };
    const vertexBindGroupLayout = this.parent.parent.device.createBindGroupLayout({
      entries: [
        spiteContextUniformLayout,
        spriteInstancesStorageLayout,
        frameUniformLayout
      ]
    });

    // Create vertex buffers and bind groups
    this.spriteInstanceBuffer = this.parent.parent.device.createBuffer({
      label: `sprite instance buffer ${this.name}`,
      size: this.instanceArray.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    const contextValues = new Float32Array([ 
      texture.width, texture.height, 
      (this.parent.parent.devicePixelRatio * this.parent.parent.zoom) / (this.parent.parent.width * 0.5), (this.parent.parent.devicePixelRatio * this.parent.parent.zoom) / (this.parent.parent.height * 0.5)
    ]);
    const contextBuffer = this.parent.parent.device.createBuffer({
      label: `sprite context buffer ${this.name}`,
      size: contextValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.parent.parent.device.queue.writeBuffer(contextBuffer, 0, contextValues);

    this.frameContextValues = new Float32Array([0, 0]);
    this.frameContextBuffer = this.parent.parent.device.createBuffer({
      label: `sprite frame context buffer ${this.name}`,
      size: this.frameContextValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.parent.parent.device.queue.writeBuffer(this.frameContextBuffer, 0, this.frameContextValues);
    

    this.vertexBindGroup = this.parent.parent.device.createBindGroup({
      label: `vertex bind group ${this.name}`,
      layout: vertexBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: contextBuffer }},
        { binding: 1, resource: { buffer: this.spriteInstanceBuffer }},
        { binding: 2, resource: { buffer: this.frameContextBuffer  }},
      ]
    });


    // Now the fragment stuff
    const textureBindGroupLayoutEntry:GPUBindGroupLayoutEntry = {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {}
    };
    const samplerBindGroupLayoutEntry:GPUBindGroupLayoutEntry = {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {}
    };
    const fragmentBindGroupLayout = this.parent.parent.device.createBindGroupLayout({
      entries: [
        textureBindGroupLayoutEntry,
        samplerBindGroupLayoutEntry
      ]
    });

    const sampler = this.parent.parent.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });

    this.fragmentBindGroup = this.parent.parent.device.createBindGroup({
      label: `fragment bind group ${this.name}`,
      layout: fragmentBindGroupLayout,
      entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: sampler }
      ]
    })




    // Create the pipeline
    const pipelineLayout = this.parent.parent.device.createPipelineLayout({
      bindGroupLayouts: [
        vertexBindGroupLayout,
        fragmentBindGroupLayout
      ]
    });
    this.pipeline = this.parent.parent.device.createRenderPipeline({
      label: `sprite pipeline ${this.name}`,
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
        ],
      },
      primitive: { topology: 'triangle-list' }
    });

    this.instanceArrayOffset = 0;
    this.instanceCount = 0;
  }

  
  draw(pos:Vec2, size:Vec2, offset:Vec2, atlasPos:Vec2) {
    // console.log(this.instanceArrayOffset);
    // Original sprite pos in world space
    this.instanceArray.set([pos.x, pos.y], this.instanceArrayOffset);
    this.instanceArrayOffset += 2;
    // Trimmed sprite size
    this.instanceArray.set([size.x, size.y], this.instanceArrayOffset);
    this.instanceArrayOffset += 2;
    // Offset from trimming
    this.instanceArray.set([offset.x, offset.y], this.instanceArrayOffset);
    this.instanceArrayOffset += 2;
    // Position in texture
    this.instanceArray.set([atlasPos.x, atlasPos.y], this.instanceArrayOffset);
    this.instanceArrayOffset += 2;

    this.instanceCount++;
  }

  endFrame(passEncoder: GPURenderPassEncoder, camera:CameraResource) {
    this.frameContextValues.set([camera.position.x * this.parent.parent.devicePixelRatio * 0.5, camera.position.y * this.parent.parent.devicePixelRatio * 0.5], 0);
    this.parent.parent.device.queue.writeBuffer(this.frameContextBuffer, 0, this.frameContextValues, 0, 2);
    this.parent.parent.device.queue.writeBuffer(this.spriteInstanceBuffer, 0, this.instanceArray, 0, this.instanceArrayOffset);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.parent.vertexBuffer);
    passEncoder.setBindGroup(0, this.vertexBindGroup);
    passEncoder.setBindGroup(1, this.fragmentBindGroup);
    passEncoder.draw(6, this.instanceCount);
    this.instanceArrayOffset = 0;
    this.instanceCount = 0;
  }
}