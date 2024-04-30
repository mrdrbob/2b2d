import Builder from "../../2B2D/Builder";
import BatStompedSignal from "../Bat/Signals/BatStompedSignal";
import GameLoopState from "../States/GameLoopState";
import PlayerCollisionSignal from "./Signals/PlayerCollisionSignal";
import PlayerDiedSignal from "./Signals/PlayerDiedSignal";
import CameraFollowsPlayer from "./Systems/CameraFollowsPlayer";
import HandleInvincibility from "./Systems/HandleInvincibility";
import HandlePain from "./Systems/HandlePain";
import HandleStomp from "./Systems/HandleStomp";
import SpawnGhost from "./Systems/SpawnGhost";
import SpawnPlayer from "./Systems/SpawnPlayer";

export default function PlayerPlugin(builder: Builder) {
  builder.schedule.enter(GameLoopState, SpawnPlayer);
  builder.schedule.update(GameLoopState, CameraFollowsPlayer);
  builder.schedule.update(GameLoopState, HandleInvincibility);
  builder.signals.handle(PlayerDiedSignal, SpawnGhost);
  builder.signals.handle(PlayerCollisionSignal, HandlePain);
  builder.signals.handle(BatStompedSignal, HandleStomp);
}