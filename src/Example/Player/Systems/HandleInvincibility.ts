import Sprite from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";

export default function HandleInvincibility(update: Update) {
  const query = update.single([ Player.NAME, Sprite.NAME ]);
  if (!query)
    return;

  const [ player, sprite ] = query.components as [ Player, Sprite ];
  if (player.invincibleTimeRemaining <= 0)
    return;

  player.invincibleTimeRemaining -= update.delta();
  if (player.invincibleTimeRemaining <= 0) {
    sprite.color.g = 1;
    sprite.color.b = 1;
    sprite.color.a = 1;
    return;
  }

  const alpha = (player.invincibleTimeRemaining % 100) / 200;

  sprite.color.g = 0.5;
  sprite.color.b = 0.5;
  sprite.color.a = alpha + 0.5;

}