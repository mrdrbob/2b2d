import TextureAsset from "../Assets/TextureAsset";
import AssetsResource from "../Resources/AssetsResource";
import CameraResource from "../Resources/CameraResource";
import LayersResource from "../Resources/LayersResource";
import Update from "../Update";

export interface Renderer {
  endFrame(passEncoder: GPURenderPassEncoder, camera:CameraResource): void;
  draw(update: Update, layer: string): void;
  beginFrame(passEncoder: GPURenderPassEncoder): void;
  initialize(parent: RenderingSystem): Promise<void>;
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
  public device!: GPUDevice;
  public context!: GPUCanvasContext;
  public presentationFormat!: GPUTextureFormat;
  public devicePixelRatio: number = 1;

  private renderers: Renderer[];
  public readonly loadedTextures: Map<string, GPUTexture> = new Map<string, GPUTexture>();

  constructor(renderers: Renderer[], public readonly width:number, public readonly height:number, public readonly zoom:number) {
    this.renderers = renderers;
  }

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


    for (const renderer of this.renderers) {
      await renderer.initialize(this);
    }
  }

  draw(update: Update) {
    const layers = update.resource<LayersResource>(LayersResource.NAME);
    const camera = update.resource<CameraResource>(CameraResource.NAME);

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
    for (const layer of layers.listAll()) {
      for (const renderer of this.renderers) {
        renderer.beginFrame(passEncoder);
        renderer.draw(update, layer);
        renderer.endFrame(passEncoder, camera);
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
