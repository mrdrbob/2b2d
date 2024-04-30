import Vec2 from "../../Math/Vec2";

export default class AtlasTextureCache {
  constructor(private device: GPUDevice) { }

  cache = new Map<string, [GPUTextureView, GPUTexture]>();

  ensure(id: string, size: Vec2, bitmap: Uint32Array): GPUTextureView {
    let view = this.cache.get(id);
    if (view)
      return view[0];

    const atlasTexture = this.device.createTexture({
      label: `atlas texture ${id}`,
      format: 'rg32uint',
      size: [size.x, size.y],
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.writeTexture(
      { texture: atlasTexture },
      bitmap,
      { bytesPerRow: size.x * 4 * 2, rowsPerImage: size.y },
      { width: size.x, height: size.y }
    );

    view = [atlasTexture.createView(), atlasTexture];
    this.cache.set(id, view);
    return view[0];
  }

  cleanup() {
    for (const view of this.cache.values()) {
      view[1].destroy();
    }

    this.cache.clear();
  }
}