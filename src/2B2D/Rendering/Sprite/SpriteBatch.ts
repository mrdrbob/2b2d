import { AtlasFrame } from "../../Assets/TextureAsset";
import Sprite from "../../Components/Sprite";
import Vec2 from "../../Math/Vec2";
import SpriteBindGroup from "./SpriteBindGroup";

const MAX_SPRITES_PER_BATCH = 1024;
const VECS_PER_SPRITE = 8; // pos, size, rg, ba, scale, atlasPos, rot, depth
const FLOATS_PER_VEC2 = 2;

export default class SpriteBatch {
  array: Float32Array;
  buffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  count = 0;

  constructor(layer: string, public parent: SpriteBindGroup, public handle: string, public view: GPUTextureView) {
    this.array = new Float32Array(VECS_PER_SPRITE * MAX_SPRITES_PER_BATCH * FLOATS_PER_VEC2);
    this.buffer = parent.device.createBuffer({
      label: `sprite instance buffer ${handle} ${layer}`,
      size: this.array.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.bindGroup = parent.device.createBindGroup({
      label: `Srite batch bind group ${handle} ${layer}`,
      layout: parent.layout,
      entries: [
        { binding: 0, resource: view }, // Texture
        { binding: 1, resource: { buffer: this.buffer } }, // Instances
      ]
    });
  }

  push(sprite: Sprite, position: Vec2, depth: number, frame: AtlasFrame) {
    // pos, size, rg, ba, scale, atlasPos, rot, depth
    this.array.set([
      position.x, position.y,
      frame.frame.w, frame.frame.h,
      sprite.color.r, sprite.color.g,
      sprite.color.b, sprite.color.a,
      sprite.scale.x, sprite.scale.y,
      frame.frame.x, frame.frame.y,
      Math.cos(sprite.radians), Math.sin(sprite.radians),
      depth, 0
    ], this.valueCount());

    this.count += 1;
  }

  instances() { return this.count * VECS_PER_SPRITE; }
  valueCount() { return this.count * VECS_PER_SPRITE * FLOATS_PER_VEC2; }
  size() { return this.valueCount() * Float32Array.BYTES_PER_ELEMENT; }

  writeToGPU() {
    this.parent.device.queue.writeBuffer(this.buffer, 0, this.array, 0, this.valueCount());
  }

  cleanup() { this.buffer.destroy(); }

  reset() { this.count = 0; }
}