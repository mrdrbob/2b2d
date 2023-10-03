// https://github.com/gfx-rs/wgpu-rs/issues/18

import AssetsResource from "../Resources/AssetsResource";
import LayersResource from "../Resources/LayersResource";
import Update from "../Update";

const quadTriangles = new Float32Array(
  [-0.5, -0.5,
    0.5, 0.5,
    0.5, -0.5,

   -0.5, -0.5,
   -0.5, 0.5,
    0.5, 0.5]
);

export interface Renderer {
  initialize(parent: RenderingSystem): Promise<void>;

  beginFrame(): void;
  draw(update: Update, layer: string): void;
  endFrame(passEncoder: GPURenderPassEncoder): void;
}

export class RenderingBuilder {
  renderers: Renderer[] = [];

  public add(renderer: Renderer) {
    this.renderers.push(renderer);
    return this;
  }

  public async finish(width:number, height:number, zoom:number) {
    const system = new RenderingSystem(this.renderers, width, height, zoom);
    await system.initialize();

    return system;
  }
}

export class RenderingSystem {
  loadedTextures: Map<string, GPUTexture> = new Map<string, GPUTexture>();

  devicePixelRatio!: number;
  device!: GPUDevice;
  context!: GPUCanvasContext;
  presentationFormat!: GPUTextureFormat;
  vertexBufferLayout!: GPUVertexBufferLayout;
  vertexBuffer!: GPUBuffer;
  worldUniformBuffer!: GPUBuffer;
  worldUniformBufferValues!: Float32Array;
  frameUniformBufferValues!: Float32Array;
  frameUniformBuffer!: GPUBuffer;
  sampler!: GPUSampler;

  constructor(private renderers: Renderer[], public readonly width:number, public readonly height:number, public readonly zoom:number) {}

  async initialize() {
    const gameDiv = document.getElementById('game');
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    gameDiv?.appendChild(canvas);

    this.devicePixelRatio = window.devicePixelRatio || 1;
    const adapter = await navigator.gpu?.requestAdapter();
    this.device = await adapter?.requestDevice()!;

    this.context = canvas.getContext('webgpu')! as GPUCanvasContext;
    this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.presentationFormat,
    });

    // Set up some common resources.
    this.createQuadVertexBuffer();
    this.createWorldUniformBuffer();
    this.createFrameUniformBuffer();
    this.createSampler();

    for (const renderer of this.renderers) {
      await renderer.initialize(this);
    }
  }

  private createWorldUniformBuffer() {
    this.worldUniformBufferValues = new Float32Array([
      (this.devicePixelRatio * this.zoom) / (this.width * 0.5), (this.devicePixelRatio * this.zoom) / (this.height * 0.5)
    ]);
    this.worldUniformBuffer = this.device.createBuffer({
      label: 'world uniform buffer',
      size: this.worldUniformBufferValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.device.queue.writeBuffer(this.worldUniformBuffer, 0, this.worldUniformBufferValues);
  }

  private createFrameUniformBuffer() {
    // Frame uniform buffer
    this.frameUniformBufferValues = new Float32Array([
      0, 0 // Camera position
    ]);
    this.frameUniformBuffer = this.device.createBuffer({
      label: 'frame uniform buffer',
      size: this.frameUniformBufferValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
  }

  private createQuadVertexBuffer() {
    this.vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT, // vec2f * 4 bytes
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2" // vec2f
        }
      ],
      stepMode: 'vertex'
    };
  
    this.vertexBuffer = this.device.createBuffer({
      size: quadTriangles.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
  
    new Float32Array(this.vertexBuffer.getMappedRange()).set(quadTriangles);
    this.vertexBuffer.unmap();
  }

  private createSampler() {
    this.sampler = this.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    })
  }

  draw(update: Update) {
    const layers = update.resource<LayersResource>(LayersResource.NAME);
    const camera = update.getCamera();
    if (!camera)
      return;
    const cameraPos = camera.globalPosition();

    const commandEncoder = this.device.createCommandEncoder();
    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: 'renderer pass',
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: [0.3, 0.3, 0.3, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    this.frameUniformBufferValues.set([cameraPos.x, cameraPos.y]);
    this.device.queue.writeBuffer(this.frameUniformBuffer, 0, this.frameUniformBufferValues, 0);

    for (const layer of layers.listAll()) {
      for (const renderer of this.renderers) {
        renderer.beginFrame();
        renderer.draw(update, layer);
        renderer.endFrame(passEncoder);
      }
    }


    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }


  public ensureTextureLoaded(textureName:string, assets:AssetsResource) {
    let gpuTexture = this.loadedTextures.get(textureName);
    if (!gpuTexture) {
      const bitmap = assets.assume<ImageBitmap>(textureName);
      gpuTexture = this.device.createTexture({
        size: [bitmap.width, bitmap.height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.device.queue.copyExternalImageToTexture(
        { source: bitmap, flipY: false },
        { texture: gpuTexture },
        { width: bitmap.width, height: bitmap.height },
      );
      this.loadedTextures.set(textureName, gpuTexture);
    }

    return gpuTexture;
  }
}
