import Sprite, { SpriteComponent } from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import Player, { PlayerComponent } from "../Components/Player";

export default function HandleInvincibility(update: Update) {
  const query = update.single([ Player.name, Sprite.name ]);
  if (!query)
    return;

  const [ player, sprite ] = query.components as [ PlayerComponent, SpriteComponent ];
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