import AnimatedTilemap from "../Components/AnimatedTilemap";
import Tilemap from "../Components/Tilemap";
import Update from "../Update";

const MAX_GENERATION = 10000;

export default function AnimateTilemaps(update: Update) {
  const query = update.query([ Tilemap.NAME, AnimatedTilemap.NAME ]);
  if (query.length == 0)
    return;

  const delta = update.delta();

  for (const entity of query) {
    const [ tilemap, animation ] = entity.components as [ Tilemap, AnimatedTilemap ];

    animation.time += delta;
    while (animation.time > animation.rate) {
      
      animation.time -= animation.rate
      animation.frame += 1;
      while (animation.frame >= animation.tags.length) {
        animation.frame -= animation.tags.length;
      }

      tilemap.generation += 1;
      if (tilemap.generation > MAX_GENERATION)
        tilemap.generation = 0;
      tilemap.tilemap = animation.tags[animation.frame];
    }
  }

}