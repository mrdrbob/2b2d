import Builder from "../../2B2D/Builder";
import CollisionTargetHitSignal from "../../2B2D/Signals/CollisionTargetHitSignal";
import PlayerTouchedFlagSignal from "../Player/Signals/PlayerTouchedFlagSignal";
import GameLoopState from "../States/GameLoopState";
import HandleDeathTileTouch from "./Systems/HandleDeathTileTouch";
import HandleFlagTileTouch from "./Systems/HandleFlagTileTouch";
import SpawnLevel from "./Systems/SpawnLevel";
import TransitionToNextLevel from "./Systems/TransitionToNextLevel";

export default function LevelPlugin(builder: Builder) {
  builder.schedule.enter(GameLoopState, SpawnLevel);
  builder.signals.handle(CollisionTargetHitSignal, HandleDeathTileTouch);
  builder.signals.handle(CollisionTargetHitSignal, HandleFlagTileTouch);
  builder.signals.handle(PlayerTouchedFlagSignal, TransitionToNextLevel);
}