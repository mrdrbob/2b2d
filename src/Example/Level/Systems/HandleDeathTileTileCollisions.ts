import CollisionTargetHitSignal from "../../../2B2D/Signals/CollisionTargetHit";
import Update from "../../../2B2D/Update";
import GameStateResouce from "../../GameStateResource";
import PlayerDied from "../../Player/Signals/PlayerDiedSignal";

export default function HandleDeathTileTileCollisions(update: Update, signal: CollisionTargetHitSignal) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.NAME);
  gameState.health = 0;
  update.signals.send(new PlayerDied(signal.position));
  update.despawn(signal.kineticBody);
}
