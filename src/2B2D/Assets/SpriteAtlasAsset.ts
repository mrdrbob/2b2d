import Asset, { Handle } from "../Asset";
import Vec2 from "../Math/Vec2";
import loadJsonAsset from "./JsonAsset";

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

export interface SpriteAtlas {
  frames: { [key: string]: AtlasFrame },
  meta: {
    size: { w: number, h: number },
    frameTags: AtlasFrameTag[]
  }
}

/** Loads a sprite atlas from JSON. This was tested using the JSON output of Aseprite. */
export default function loadSpriteAtlasAsset(name: Handle, url: string) {
  return loadJsonAsset<SpriteAtlas>(name, url);
}

/** All sprites require an atlas, even if they are a single, full frame. This method generates
 * the required atlas with a single frame: '0'.
 */
export function generateSingleSpriteAtlas(name: Handle, size: Vec2) {
  const atlas: SpriteAtlas = {
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

  return new Asset<SpriteAtlas>(name, Promise.resolve(atlas));
}

/** Generates a sprite atlas that can be used to address individual tiles from a tilemap */
export function generateTiledSpriteAtlas(name: string, tileSize: Vec2, tileCount: Vec2, padding: Vec2) {
  const atlas: SpriteAtlas = {
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

  return new Asset<SpriteAtlas>(name, Promise.resolve(atlas));
}
