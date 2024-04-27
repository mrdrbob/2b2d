import Position from "../../../2B2D/Components/Position";
import Update from "../../../2B2D/Update";
import Config from "../../Config";
import GameStateResource from "../../GameStateResource";
import Player from "../Components/Player";
import PlayerDiedSignal from "../Signals/PlayerDiedSignal";
import PlayerHurtSignal from "../Signals/PlayerCollisionSignal";
import PlayerDamagedSignal from "../Signals/PlayerDamagedSignal";

export default function HandlePain(update: Update, signals: PlayerHurtSignal[]) {
  if (signals.length == 0)
    return;

  const signal = signals[0];
  const player = update.ecs.get(signal.player, Player)!;

  if (player.invincibleTime > 0)
    return;
  
  const gameState = update.resource(GameStateResource);
  gameState.health -= signal.damage;

  if (gameState.health <= 0) {
    const pos = update.ecs.get(signal.player, Position)!;
    const position = update.resolve.position(signal.player, pos);
    update.despawn(signal.player);
    update.signals.send(new PlayerDiedSignal(signal.sender, position));
    return;
  }

  update.signals.send(PlayerDamagedSignal);
  player.invincibleTime = Config.InvincibilityTime;
}