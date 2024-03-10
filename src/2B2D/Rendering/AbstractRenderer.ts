import { Handle } from "../Asset";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";
import Renderer from "./Renderer";
import RenderingSystem from "./RenderingSystem";

export default abstract class AbstractRenderer implements Renderer {
  abstract name: string;

  constructor(protected parent: RenderingSystem) {
  }

  textureCache = new Map<Handle, GPUTextureView>();

  ensureTextureLoadedToGpu(assets: AssetsResource, handle: Handle) {
    const cachedGpuTexture = this.textureCache.get(handle);
    if (cachedGpuTexture)
      return cachedGpuTexture;

    const bitmap = assets.assume<ImageBitmap>(handle);
    const gpuTexture = this.parent.device.createTexture({
      size: [bitmap.width, bitmap.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.parent.device.queue.copyExternalImageToTexture(
      { source: bitmap, flipY: false },
      { texture: gpuTexture },
      { width: bitmap.width, height: bitmap.height },
    );

    const view = gpuTexture.createView();
    this.textureCache.set(handle, view);
    return view;
  }

  protected getSharedBindGroupLayoutEntries(): GPUBindGroupLayoutEntry[] {
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

  protected getFragmentColorTargets(): GPUColorTargetState[] {
    return [
      {
        format: this.parent.presentationFormat,
        blend: {
          color: {
            srcFactor: "src-alpha",
            dstFactor: 'one-minus-src-alpha',
            operation: 'add'
          },
          alpha: {
            srcFactor: 'one',
            dstFactor: 'one-minus-src-alpha',
            operation: 'add'
          }
        },
        writeMask: GPUColorWrite.ALL
      }
    ];
  }

  abstract beginFrame(update: Update): void;
  abstract drawLayer(passEncoder: GPURenderPassEncoder, layer: string): void;
  abstract endFrame(): void;
  abstract cleanup(): void;
}