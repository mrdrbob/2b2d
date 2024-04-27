import CollisionTargetHitSignal from "../../../2B2D/Signals/CollisionTargetHitSignal";
import Update from "../../../2B2D/Update";
import GameStateResource from "../../GameStateResource";
import PlayerDiedSignal from "../../Player/Signals/PlayerDiedSignal";
import DeathTarget from "../DeathTarget";

export default function HandleDeathTileTouch(update: Update, signals: CollisionTargetHitSignal[]) {
  for (const hit of signals) {
    if (hit.sender != DeathTarget)
      continue;

    const gameState = update.resource(GameStateResource);
    gameState.health = 0;
    
    update.despawn(hit.kineticBody.entity);
    update.signals.send(new PlayerDiedSignal('LevelPlugin', hit.kineticBody.position));
  }
}