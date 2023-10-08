import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import { bringThePain, spawnCamera, spawnHud, updateHealthItems } from "./Systems";

export default function addHud(builder:GameEngineBuilder) {
  builder.systems.enter(States.SPAWN_CAM, spawnCamera);
  builder.systems.enter(States.GAME, spawnHud);
  // builder.systems.update(States.GAME, bringThePain);
  builder.systems.update(States.GAME, updateHealthItems);
}
