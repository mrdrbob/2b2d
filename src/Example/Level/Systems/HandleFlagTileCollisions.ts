import CollsisionTargetHitSignal from "../../../2B2D/Signals/CollsisionTargetHit";
import Update from "../../../2B2D/Update";
import Player from "../../Player/Components/Player";
import PlayerTouchedFlag from "../../Player/Signals/PlayerTouchedFlag";

export default function HandleFlagTileCollisions(update: Update, signal: CollsisionTargetHitSignal) {
  const assets = update.assets();

  // Disable player controls
  const player = update.get<Player>(signal.kineticBody, Player.NAME);
  if (player)
    player.controlsEnabled = false;

  update.despawn(signal.target);

  update.signals.send(PlayerTouchedFlag);
}