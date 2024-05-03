import { Handle } from "../Handle";
import Vec2 from "../Math/Vec2";


export interface LayerFrame {
  bitmap: Uint32Array,
}

export class Layer {
  constructor(
    public size: Vec2,
    public texture: Handle,
    public gridSize: number
  ) { }
  frames = new Array<LayerFrame>();
}

export class Level {
  constructor(
    public size: Vec2
  ) { }
  layers = new Map<string, Layer>();
}

/** Represents levels that can be rendered as a Tilemap */
export class LevelsAsset {
  levels = new Map<string, Level>();
  textures = new Map<string, ImageBitmap>();
}
