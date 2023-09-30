import Asset from "../Asset";
import Vec2 from "../Math/Vec2";

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

const PLUS_ONE = new Vec2(1, 1);
const MINUS_ONE = new Vec2(-1, -1);

async function load(url: string) {
  var res = await fetch(url);
  var json = await res.json();
  return json as SpriteAtlas;
}

export function loadSpriteAtlasAsset(name: string, url: string) {
  const promise = load(url);
  return new Asset(name, promise);
}

export function generateSingleSpriteAtlas(name: string, size: Vec2) {
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
      const framePos = pos.add(MINUS_ONE);
      const frameSize = tileSize.add(PLUS_ONE);

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
