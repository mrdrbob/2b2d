import Sprite from "../../Components/Sprite";
import SpriteBatch from "./SpriteBatch";

export default class SpriteBindGroup {

  layout: GPUBindGroupLayout;
  batches = new Map<string, Map<string, SpriteBatch>>();

  constructor(public device: GPUDevice) {
    this.layout = device.createBindGroupLayout({
      label: 'Sprite bindgroup layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Texture
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }, // Sprites array
      ]
    });
  }

  batch(layer: string, sprite: Sprite, view: GPUTextureView) {
    let layerBatch = this.batches.get(layer);
    if (!layerBatch) {
      layerBatch = new Map<string, SpriteBatch>();
      this.batches.set(layer, layerBatch);
    }
    let batch = layerBatch.get(sprite.handle);
    if (!batch) {
      batch = new SpriteBatch(layer, this, sprite.handle, view);
      layerBatch.set(sprite.handle, batch);
    }

    return batch;
  }

  cleanup() {
    for (const layerBatch of this.batches.values()) {
      for (const batch of layerBatch.values()) {
        batch.cleanup();
      }
    }
  }
}