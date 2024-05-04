import { LevelsAsset } from "../Assets/LevelsAsset";
import AnimatedTilemap from "../Components/AnimatedTilemap";
import Tilemap from "../Components/Tilemap";
import Update from "../Update";

export default function AnimateTilemaps(update: Update) {
  const query = update.ecs.query(Tilemap, AnimatedTilemap);
  if (query.length == 0)
    return;

  const delta = update.delta;

  for (const entity of query) {
    const [tilemap, animation] = entity.components as [Tilemap, AnimatedTilemap];

    animation.time += delta;
    while (animation.time > animation.rate) {

      if (animation.totalFrames == undefined) {
        const assets = update.assets();
        const levels = assets.assume<LevelsAsset>(tilemap.handle)!;
        const level = levels.levels.get(tilemap.level)!;
        const layer = level.layers.get(tilemap.layer)!;
        const frameCount = layer.frames.length;
        animation.totalFrames = frameCount;
      }

      animation.time -= animation.rate
      animation.frame += 1;
      while (animation.frame >= animation.totalFrames) {
        animation.frame -= animation.totalFrames;
      }

      tilemap.frame = animation.frame;
    }
  }
}