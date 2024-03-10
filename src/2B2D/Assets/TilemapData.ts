import Asset from "../Asset";
import Vec2 from "../Math/Vec2";
import LdtkData from "./LdtkData";

export interface TilemapData {
  tileSize: Vec2,
  spriteTileCount: Vec2,
  mapTileCount: Vec2,
  data: Uint32Array
}

/** Turns an level / layer from an LDTK json file into Tilemap data that can be used by the Tilemap renderer. */
export default function createTilemapFromLdtkJson(
  name: string,
  ldtkJson: LdtkData,
  levelName: string,
  layerName: string,
  frame: number
) {
  const ldtkData = ldtkJson as LdtkData;

  const level = ldtkData.levels.find(x => x.identifier == levelName)!;
  const layer = level.layerInstances.find(x => x.__identifier == layerName)!;
  const tileset = ldtkData.defs.tilesets.find(x => x.uid == layer.__tilesetDefUid)!;

  const tileSize = new Vec2(tileset.tileGridSize, tileset.tileGridSize);
  const spriteTileCount = new Vec2(tileset.__cWid, tileset.__cHei);
  const mapTileCount = new Vec2(layer.__cWid, layer.__cHei);

  if (tileset.spacing != 0)
    throw new Error('Tilemaps only work with 0-spacing sprites');

  const customDataMap = new Map<number, Array<Array<number>>>();
  if (frame != 0) {
    for (const item of tileset.customData) {
      customDataMap.set(item.tileId, JSON.parse(item.data) as Array<Array<number>>);
    }
  }


  const totalElements = mapTileCount.x * mapTileCount.y * 2;
  const data = new Uint32Array(totalElements);
  let offset = 0;
  for (let y = 0; y < mapTileCount.y; y++) {
    for (let x = 0; x < mapTileCount.x; x++) {
      const tile = layer.gridTiles.find(i => i.px[0] == x * tileSize.x && i.px[1] == y * tileSize.y);
      if (!tile) {
        data.set([256, 256], offset);
        offset += 2;
        continue;
      }

      let srcX = tile.src[0] / tileSize.x;
      let srcY = tile.src[1] / tileSize.y;

      const customData = customDataMap.get(tile.t);
      if (customData) {
        const [offsetX, offsetY] = customData[frame - 1] as [number, number];
        srcX += offsetX;
        srcY += offsetY;
      }

      data.set([srcX, srcY], offset);
      offset += 2;
    }
  }

  const tilemapData: TilemapData = {
    tileSize,
    spriteTileCount,
    mapTileCount,
    data
  };

  return new Asset<TilemapData>(name, Promise.resolve(tilemapData));
}
