import AnimatedTilemap from "../Components/AnimatedTilemap";
import Tilemap from "../Components/Tilemap";
import Update from "../Update";

export default function updateAnimatedTilemaps(update:Update) {
  const query = update.queryCached('updateAnimatedTilemaps', [ Tilemap.NAME, AnimatedTilemap.NAME ]);

  const delta = update.deltaTime();

  for (const entity of query) {
    const [ tilemap, animation ] = entity.components as [ Tilemap, AnimatedTilemap ];

    animation.time += delta;
    while (animation.time > animation.rate) {
      animation.time -= animation.rate
      animation.frame += 1;
      while (animation.frame >= animation.tags.length) {
        animation.frame -= animation.tags.length;
      }

      tilemap.tilemap = animation.tags[animation.frame];
    }
  }
}