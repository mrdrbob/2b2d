import Sprite from "../Engine/Components/Sprite";
import Update from "../Engine/Update";
import BaseSpriteRenderer, { RenderBatch } from "../Engine/Rendering/BaseSpriteRenderer";
import { RenderingSystem } from "../Engine/Rendering/Renderer";
import wgsl from './Shaders/Sprite-Wobbly.wgsl?raw';


// An example custom renderer that mostly uses BaseSpriteRenderer
interface JiggleBatch extends RenderBatch {

}

export default class SpriteJiggleRenderer extends BaseSpriteRenderer<JiggleBatch> {
  jiggleValues!: Float32Array;
  jiggleBuffer!: GPUBuffer;

  static readonly NAME:string = 'jiggle-renderer';
  
  name(): string { return SpriteJiggleRenderer.NAME; }

  override async initialize(parent: RenderingSystem) {
    this.jiggleValues = new Float32Array([ 0 ]);
    this.jiggleBuffer = parent.device.createBuffer({
      label: 'world uniform buffer',
      size: this.jiggleValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    parent.device.queue.writeBuffer(this.jiggleBuffer, 0, this.jiggleValues);

    await super.initialize(parent);
  }

  protected override getSharedBindGroupLayoutEntries(): GPUBindGroupLayoutEntry[] {
    const entries = super.getSharedBindGroupLayoutEntries();
    entries.push(
      { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // Jiggle
    )
    return entries;
  }

  protected override getSharedBindGroupEntries(): GPUBindGroupEntry[] {
    const entries = super.getSharedBindGroupEntries();
    entries.push(
      { binding: 3, resource: { buffer: this.jiggleBuffer } }
    );

    return entries;
  }

  protected override canProcessSprite(sprite: Sprite): boolean {
    return sprite.specialRenderer === SpriteJiggleRenderer.NAME;
  }

  getWgsl(): string { return wgsl; }


  time:number = 0;
  override draw(update: Update, layer: string): void {
    this.time += update.deltaTime();
    super.draw(update, layer);
  }

  override endFrame(passEncoder: GPURenderPassEncoder): void {
    this.jiggleValues[0] = this.time;
    this.parent.device.queue.writeBuffer(this.jiggleBuffer, 0, this.jiggleValues);

    super.endFrame(passEncoder);
  }

  protected createBatch(texture: GPUTexture, gpuBuffer: GPUBuffer, bufferValues: Float32Array, count: number): JiggleBatch {
    return { texture, gpuBuffer, bufferValues, count };
  }

}