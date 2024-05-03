import { Handle } from "../Handle";
import AABB from "../Math/AABB";
import Vec2 from "../Math/Vec2";
import { resolvePath } from "../Util/FilePaths";
import { loadJson } from "../Util/Json";
import { loadTexture } from "../Util/Textures";
import Asset from "./Asset";
import { Layer, Level, LevelsAsset } from "./LevelsAsset";

export interface LdtkData {
  defs: {
    layers: Array<{
      uid: number,
      identifier: string,
      type: string,
      gridSize: number,
      tilesetDefUid: number
    }>,
    tilesets: Array<{
      uid: number,
      identifier: string,
      relPath: string,
      tileGridSize: number,
      customData: [
        { tileId: number, data: string }
      ]
    }>,
    entities: Array<{
      uid: number,
      identifier: string,
      width: number,
      height: number,
      fieldDefs: Array<{
        identifier: string,
        uid: number,
        isArray: boolean,
      }>
    }>
  },
  levels: Array<{
    identifier: string,
    uid: number,
    pxWid: number,
    pxHei: number,
    layerInstances: Array<{
      layerDefUid: number,
      intGridCsv: Array<number>,
      gridTiles: Array<{
        px: [number, number],
        src: [number, number],
        t: number
      }>,
      entityInstances: Array<{
        defUid: number,
        px: [number, number],
        fieldInstances: Array<{
          defUid: number,
          __identifier: string,
          __value: any
        }>
      }>
    }>
  }>
}

const INVISIBLE = 2147483647;

/** A LevelAsset that is specific to LDTK levels. Has utility methods for spawning
 * entities and intGrid entities
 */
export default class LdktLevelsAsset extends LevelsAsset {
  constructor(
    public data: LdtkData
  ) { super(); }

  static async create(path: string) {
    const json = await loadJson<LdtkData>(path);
    const asset = new LdktLevelsAsset(json);

    // Preload all textures
    for (const tileset of json.defs.tilesets) {
      if (asset.textures.has(tileset.relPath))
        continue;
      const texturePath = resolvePath(path, tileset.relPath);
      const bitmap = await loadTexture(texturePath);
      asset.textures.set(tileset.relPath, bitmap);
    }

    for (const level of json.levels) {
      // Get the level object (to hold layers)
      let levelData = asset.levels.get(level.identifier);
      if (!levelData) {
        levelData = new Level(Vec2.from(level.pxWid, level.pxHei));
        asset.levels.set(level.identifier, levelData);
      }

      for (const layer of level.layerInstances) {
        const def = json.defs.layers.find(x => x.uid == layer.layerDefUid);
        if (!def || def.type !== 'Tiles')
          continue;

        const tileset = json.defs.tilesets.find(x => x.uid == def.tilesetDefUid);
        if (!tileset)
          continue;

        // Need to divide by grid size in a few places. Instead
        // calculate the inverse to do multiplication.
        const gridSizeInverse = 1 / def.gridSize;

        // Get the layer data (to hold frames)
        let layerData = levelData.layers.get(def.identifier);

        // Create the layer information
        if (!layerData) {
          // Get the "size" based on tiles farthest from 0, 0
          // px values are not grid positions, but actual pixel
          // positions, so divide by grid size. Get the biggest
          // x and y values and then move to grid, then add one
          // to represent size and not "biggest index"
          const size = Vec2.from(
            layer.gridTiles.reduce((prev, current) => current.px[0] > prev ? current.px[0] : prev, 0),
            layer.gridTiles.reduce((prev, current) => current.px[1] > prev ? current.px[1] : prev, 0),
          ).scalarMultiply(gridSizeInverse).add(Vec2.from(1, 1));

          layerData = new Layer(size, tileset.relPath as Handle, def.gridSize);

          levelData.layers.set(def.identifier, layerData);
        }

        // Gather the frames from custom data.
        const frames = new Map<number, Vec2[]>();
        let frameCount = 1; // Everything has one frame even if it doesn't.
        for (const custom of tileset.customData) {
          const position = JSON.parse(custom.data) as Array<[number, number]>;
          // The offsets don't include frame 0, which will always be a 0,0 offset, so force that here.
          const offets = [Vec2.ZERO].concat(position.map(x => Vec2.from(...x)));
          frames.set(custom.tileId, offets);
          frameCount = Math.max(frameCount, offets.length);
        }

        // Iterate through all possible frames
        for (let frame = 0; frame < frameCount; frame++) {
          // Create a bitmap to hold all atlas locations for
          // visible tiles.
          const bitmap = new Uint32Array(layerData.size.x * layerData.size.y * 2);
          bitmap.fill(INVISIBLE);

          for (const tile of layer.gridTiles) {
            // Location of tile in tilemap
            const px = Vec2.from(...tile.px).scalarMultiply(gridSizeInverse);
            // Source on texture
            let src = Vec2.from(...tile.src).scalarMultiply(gridSizeInverse);

            // Apply animation offsets as necessary
            const animationOffset = frames.get(tile.t);
            if (animationOffset && frame < animationOffset.length) {
              src = src.add(animationOffset[frame]);
            }

            const offset = ((px.y * layerData.size.x) + px.x) * 2;
            bitmap.set([src.x, src.y], offset);
          }

          // Now store the processed frame
          layerData.frames[frame] = {
            bitmap
          };
        }
      }
    }

    return asset;
  }

  static load(handle: Handle, path: string) {
    const promise = LdktLevelsAsset.create(path);
    return Asset.from(handle, promise);
  }

  getLevelOffset(levelName: string) {
    const level = this.data.levels.find(x => x.identifier == levelName)!;
    const offset = Vec2.from(level.pxWid, level.pxHei).scalarMultiply(-0.5);
    return { offset, invert: (y: number) => { return level.pxHei - y; } };
  }

  getEntities(levelName: string, layerName: string) {
    const level = this.data.levels.find(x => x.identifier == levelName)!;
    const layerDef = this.data.defs.layers.find(x => x.identifier == layerName)!;

    const offset = Vec2.from(level.pxWid, level.pxHei).scalarMultiply(-0.5);

    const layerInstance = level.layerInstances.find(x => x.layerDefUid == layerDef.uid)!;
    const output = layerInstance.entityInstances.map(entityInstance => {
      const entityDef = this.data.defs.entities.find(x => x.uid == entityInstance.defUid)!;

      const position = new Vec2(entityInstance.px[0], level.pxHei - entityInstance.px[1]).add(offset);

      return { position, type: entityDef.identifier, fieldInstances: entityInstance.fieldInstances };
    });

    return output;
  }

  getIntGrid(levelName: string, layerName: string) {
    const level = this.data.levels.find(x => x.identifier == levelName)!;
    const layerDef = this.data.defs.layers.find(x => x.identifier == layerName)!;

    // Because anchors are all the center of the object, we need to offset the center of the level and the grid.
    const offset = Vec2.from(level.pxWid, level.pxHei).scalarMultiply(-0.5);
    const halfGrid = Vec2.from(layerDef.gridSize, -layerDef.gridSize).scalarMultiply(0.5);

    // Calculate the size of the grid (number of grid cells)
    const sizeGrid = Vec2.from(level.pxWid, level.pxHei).scalarMultiply(1 / layerDef.gridSize); //.floor();

    // The AABB sizes are going to consistently be the half he px size of a grid cell.
    const aabbSize = Vec2.from(layerDef.gridSize, layerDef.gridSize).scalarMultiply(0.5);

    const layerInstance = level.layerInstances.find(x => x.layerDefUid == layerDef.uid)!;
    const output = new Array<{ type: number, aabb: AABB }>();
    for (let i = 0; i < layerInstance.intGridCsv.length; i++) {
      // Skip any 0 values
      const value = layerInstance.intGridCsv[i];
      if (value == 0)
        continue;

      // Calculate the grid x,y position
      const y = Math.floor(i / sizeGrid.x);
      const x = i - (y * sizeGrid.x);

      // The final position of the tile is going to be index * px size of level (with y inverted), then offset half 
      // a grid cell to account for the centered anchor point.
      const position = new Vec2(layerDef.gridSize * x, level.pxHei - (y * layerDef.gridSize)).add(offset).add(halfGrid);
      output.push({
        type: value,
        aabb: new AABB(position, aabbSize)
      });
    }

    return output;
  }
}