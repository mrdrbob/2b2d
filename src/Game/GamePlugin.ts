import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import { cameraFollowPlayer, movePlayerAround, spawnGame } from "./GameSystems";

export default function addMainMenu(builder:GameEngineBuilder) {
  builder.systems.enter(States.MAIN_MENU, spawnGame);
  builder.systems.update(States.MAIN_MENU, movePlayerAround);
  builder.systems.update(States.MAIN_MENU, cameraFollowPlayer);
}