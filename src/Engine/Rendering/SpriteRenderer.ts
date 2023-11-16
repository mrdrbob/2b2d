import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";
import BaseSpriteRenderer, { RenderBatch } from "./BaseSpriteRenderer";
import { Renderer, RenderingSystem } from "./Renderer";
import wgsl from './Shaders/Sprite.wgsl?raw';

const MAX_SPRITES:number = 1000;
const VALUES_PER_SPRITE:number = 12; // 2 values each: pos, size, rg, ba, scale, atlasPos

interface SpriteBatch extends RenderBatch {
}



export default class SpriteRenderer extends BaseSpriteRenderer<SpriteBatch> {
  name(): string { return "default-sprite"; }

  getWgsl(): string { return wgsl; }

  protected createBatch(texture: GPUTexture, gpuBuffer: GPUBuffer, bufferValues: Float32Array, count: number): SpriteBatch {
    return { texture, gpuBuffer, bufferValues, count };
  }

}