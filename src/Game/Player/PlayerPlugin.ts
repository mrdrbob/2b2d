import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import cameraFollowPlayer from "./Systems/CameraFollowPlayer";
import movePlayer from "./Systems/MovePlayer";
import spawnPlayer from "./Systems/SpawnPlayer";

export default function addPlayer(builder:GameEngineBuilder) {
  builder.systems.enter(States.GAME, spawnPlayer);
  builder.systems.update(States.GAME, cameraFollowPlayer);
  builder.systems.update(States.GAME, movePlayer);
}