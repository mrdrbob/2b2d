import Builder from "../../2B2D/Builder";
import CollisionTargetHitSignal from "../../2B2D/Signals/CollisionTargetHitSignal";
import GameLoopState from "../States/GameLoopState";
import HandlePlayerCollision from "./Systems/HandlePlayerCollision";
import SpawnBats from "./Systems/SpawnBats";

export default function BatPlugin(builder: Builder) {
  builder.schedule.enter(GameLoopState, SpawnBats);
  builder.signals.handle(CollisionTargetHitSignal, HandlePlayerCollision);
}