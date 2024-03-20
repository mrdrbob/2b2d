import Builder from "../../2B2D/Builder";
import CollisionTargetHit from "../../2B2D/Signals/CollisionTargetHit";
import States from "../States";
import HandleDeathTileTileCollisions from "./Systems/HandleDeathTileTileCollisions";
import HandleFlagTileCollisions from "./Systems/HandleFlagTileCollisions";
import SpawnLevel from "./Systems/SpawnLevel";

export const DeathTileTarget = 'DeathTileTarget';
export const FlagTileTarget = 'FlagTileTarget';

export default function LevelPlugin(builder: Builder) {
  builder.handleFromTyped<CollisionTargetHit>(CollisionTargetHit.NAME, DeathTileTarget, HandleDeathTileTileCollisions);
  builder.handleFromTyped<CollisionTargetHit>(CollisionTargetHit.NAME, FlagTileTarget, HandleFlagTileCollisions);

  builder.enter(States.Gameloop, SpawnLevel);
}
