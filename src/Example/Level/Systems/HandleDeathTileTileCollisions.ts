import { CollsisionTargetHitSignal } from "../../../2B2D/Signals/CollsisionTargetHit";
import Update from "../../../2B2D/Update";
import { GameStateResouce } from "../../GameStateResource";
import PlayerDied from "../../Player/Signals/PlayerDiedSignal";

export default function HandleDeathTileTileCollisions(update:Update, signal:CollsisionTargetHitSignal) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.name);
  gameState.health = 0;
  update.signals.send(PlayerDied(signal.position));
  update.despawn(signal.kineticBody);
}
