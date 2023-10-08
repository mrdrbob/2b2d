import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import cameraFollowPlayer from "./Systems/CameraFollowPlayer";
import detectEnemyHit from "./Systems/DetectHit";
import flickerInvinciblePlayer from "./Systems/FlickerInvinciblePlayer";
import movePlayer from "./Systems/MovePlayer";
import spawnPlayer from "./Systems/SpawnPlayer";

export default function addPlayer(builder:GameEngineBuilder) {
  builder.systems.enter(States.GAME, spawnPlayer);
  builder.systems.update(States.GAME, cameraFollowPlayer);
  builder.systems.update(States.GAME, movePlayer);
  builder.systems.update(States.GAME, flickerInvinciblePlayer);
  builder.systems.update(States.GAME, detectEnemyHit);
}