import Builder from "../../2B2D/Builder";
import PlayerDiedSignal from "../Player/Signals/PlayerDiedSignal";
import DeathCleanup from "./Components/DeathCleanup";
import DeathState from "./States/DeathState";
import HandlePlayerDeath from "./Systems/HandlePlayerDeath";
import SpawnDeathScreen from "./Systems/SpawnDeathScreen";

export default function DeathPlugin(builder: Builder) {
  builder.signals.handle(PlayerDiedSignal, HandlePlayerDeath);
  builder.schedule.enter(DeathState, SpawnDeathScreen);

  builder.schedule.cleanup(DeathState, DeathCleanup);
}