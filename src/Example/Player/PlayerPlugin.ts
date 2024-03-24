import Builder from "../../2B2D/Builder";
import EnemyCollision from "../Enemy/Signals/EnemyCollisionSignal";
import States from "../States";
import PlayerDied from "./Signals/PlayerDiedSignal";
import BounceOnStomps from "./Systems/BounceOnStomps";
import cameraFollowPlayer from "./Systems/CameraFollowPlayer";
import HandleInvincibility from "./Systems/HandleInvincibility";
import SpawnGhost from "./Systems/SpawnGhost";
import spawnPlayer from "./Systems/SpawnPlayer";
import TakeEnemyDamage from "./Systems/TakeEnemyDamage";

export const PlayerJumpedSignal = 'PlayerJumpedSignal';

export default function PlayerPlugin(builder: Builder) {
  builder.enter(States.Gameloop, spawnPlayer);
  builder.update(States.Gameloop, cameraFollowPlayer);
  builder.update(States.Gameloop, HandleInvincibility);


  builder.handle(EnemyCollision.NAME, BounceOnStomps);
  builder.handle(EnemyCollision.NAME, TakeEnemyDamage);
  builder.handle(PlayerDied.NAME, SpawnGhost);
}
