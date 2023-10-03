import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import addLevel from "./Level/LevelPlugin";
import addPlayer from "./Player/PlayerPlugin";
import { GameStateResource } from "./Resources";
import { closeCurtains } from "./Systems";

// Plugin
export default function addGamePlay(builder:GameEngineBuilder) {
  builder.resources.addResource(new GameStateResource());
  addLevel(builder);
  addPlayer(builder);

  builder.systems.enter(States.GAME, closeCurtains);
}
