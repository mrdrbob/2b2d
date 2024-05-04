import { Handle } from "../Handle";

export default class GpuTextureCache {
  constructor(private device: GPUDevice) { }

  cache = new Map<Handle, [GPUTextureView, GPUTexture]>();

  ensure(handle: Handle, bitmap: ImageBitmap): GPUTextureView {
    let view = this.cache.get(handle);
    if (view)
      return view[0];

    const gpuTexture = this.device.createTexture({
      size: [bitmap.width, bitmap.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.copyExternalImageToTexture(
      { source: bitmap, flipY: false },
      { texture: gpuTexture },
      { width: bitmap.width, height: bitmap.height },
    );

    view = [gpuTexture.createView(), gpuTexture];
    this.cache.set(handle, view);
    return view[0];
  }

  cleanup() {
    for (const view of this.cache.values()) {
      view[1].destroy();
    }

    this.cache.clear();
  }
}