import Sprite from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";

export default function HandleInvincibility(update: Update) {
  const query = update.ecs.single(Player, Sprite);
  if (!query)
    return;

  const [player, sprite] = query.components as [Player, Sprite];
  if (player.invincibleTime <= 0)
    return;

  player.invincibleTime -= update.delta;
  if (player.invincibleTime <= 0) {
    sprite.color.g = 1;
    sprite.color.b = 1;
    sprite.color.a = 1;
    return;
  }

  const alpha = (player.invincibleTime % 100) / 200;

  sprite.color.g = 0.5;
  sprite.color.b = 0.5;
  sprite.color.a = alpha + 0.5;

}