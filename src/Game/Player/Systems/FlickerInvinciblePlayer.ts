import Sprite from "../../../Engine/Components/Sprite";
import Update from "../../../Engine/Update";
import { Player } from "../Components";

export default function flickerInvinciblePlayer(update:Update) {
  const query = update.queryCached('flickerInvinciblePlayer', [ Player.NAME, Sprite.NAME ]);
  if (query.length == 0)
    return;
  
  const [ player, sprite ] = query[0].components as [ Player, Sprite ];

  if (player.invincibleTimeRemaining > 0) {
    player.invincibleTimeRemaining -= update.deltaTime();
    if (player.invincibleTimeRemaining <= 0) {
      sprite.color[1] = sprite.color[2] = sprite.color[3] = 1;
    } else {
      const alpha = (player.invincibleTimeRemaining % 100) / 200;

      sprite.color[1] = sprite.color[2] = 0.5;
      sprite.color[3] = alpha + 0.5;
    }
  }
}