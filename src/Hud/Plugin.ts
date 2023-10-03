import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import { spawnHud } from "./Systems";

export default function addHud(builder:GameEngineBuilder) {
  builder.systems.enter(States.LOADING, spawnHud);
}
