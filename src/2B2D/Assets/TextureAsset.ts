import { Handle } from "../Handle";
import Vec2 from "../Math/Vec2";
import { loadJson } from "../Util/Json";
import { loadTexture } from "../Util/Textures";
import Asset from "./Asset";

export interface AtlasFrame {
  frame: { x: number, y: number, w: number, h: number },
  rotated: boolean,
  trimmed: boolean,
  spriteSourceSize: { x: number, y: number, w: number, h: number },
  sourceSize: { x: number, y: number },
  duration: number
}

export interface AtlasFrameTag {
  name: string,
  from: number,
  to: number,
}

export interface Atlas {
  frames: { [key: string]: AtlasFrame },
  meta: {
    size: { w: number, h: number },
    frameTags: AtlasFrameTag[]
  }
}

export default class TextureAsset {
  constructor(
    public handle: Handle,
    public texture: ImageBitmap,
    public atlas: Atlas
  ) { }

  static loadSingleSprite(handle: Handle, path: string) {
    const promise = (async () => {
      const texture = await loadTexture(path);
      const atlas = generateSingleSpriteAtlas(new Vec2(texture.width, texture.height));
      return new TextureAsset(handle, texture, atlas);
    });

    return Asset.from<TextureAsset>(handle, promise());
  }

  static loadTiledSprite(handle: Handle, path: string, tileSize: Vec2, tileCount: Vec2, padding: Vec2) {
    const promise = (async () => {
      const texture = await loadTexture(path);
      const atlas = generateTiledSpriteAtlas(tileSize, tileCount, padding);
      return new TextureAsset(handle, texture, atlas);
    });

    return Asset.from<TextureAsset>(handle, promise());
  }

  static loadSpriteWithAtlas(handle: Handle, spritePath: string, atlasPath: string) {
    const promise = (async () => {
      const texture = await loadTexture(spritePath);
      const atlas = await loadJson<Atlas>(atlasPath);

      return new TextureAsset(handle, texture, atlas);
    });

    return Asset.from<TextureAsset>(handle, promise());
  }
}

function generateSingleSpriteAtlas(size: Vec2) {
  const atlas: Atlas = {
    frames: {
      "0": {
        duration: 0,
        frame: { x: -1, y: -1, w: size.x + 1, h: size.y + 1 },
        rotated: false,
        trimmed: false,
        sourceSize: { x: size.x, y: size.y },
        spriteSourceSize: { x: 0, y: 0, w: size.x, h: size.y }
      }
    },
    meta: {
      size: { w: size.x * size.x, h: size.y * size.y },
      frameTags: [
        { name: '0', from: 0, to: 0 }
      ]
    }
  };

  return atlas;
}

function generateTiledSpriteAtlas(tileSize: Vec2, tileCount: Vec2, padding: Vec2) {
  const atlas: Atlas = {
    frames: {},
    meta: {
      size: { w: tileSize.x * tileCount.x, h: tileSize.y * tileCount.y },
      frameTags: []
    }
  };

  for (let y = 0; y < tileCount.y; y++) {
    for (let x = 0; x < tileCount.x; x++) {
      const id = new Vec2(x, y);

      const pos = (id.multiply(tileSize)).add(id.multiply(padding));
      const framePos = pos; //pos.add(MINUS_ONE);
      const frameSize = tileSize; //tileSize.add(PLUS_ONE);

      atlas.frames[`${pos.x},${pos.y}`] = {
        frame: { x: framePos.x, y: framePos.y, w: frameSize.x, h: frameSize.y },
        duration: 0,
        rotated: false,
        trimmed: false,
        sourceSize: { x: tileSize.x, y: tileSize.y },
        spriteSourceSize: { x: 0, y: 0, w: tileSize.x, h: tileSize.y }
      }
    };
  }

  return atlas;
}