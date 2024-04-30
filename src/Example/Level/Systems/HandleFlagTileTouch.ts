import CollisionTargetHitSignal from "../../../2B2D/Signals/CollisionTargetHitSignal";
import Update from "../../../2B2D/Update";
import Player from "../../Player/Components/Player";
import PlayerTouchedFlagSignal from "../../Player/Signals/PlayerTouchedFlagSignal";
import FlagTarget from "../FlagTarget";

export default function HandleFlagTileTouch(update: Update, signals: CollisionTargetHitSignal[]) {
  for (const hit of signals) {
    if (hit.sender != FlagTarget)
      continue;

    const player = update.ecs.single(Player);
    if (player)
      player.components[0].controlsEnabled = false;

    update.despawn(hit.target.entity);
    update.signals.send(PlayerTouchedFlagSignal);
  }
}