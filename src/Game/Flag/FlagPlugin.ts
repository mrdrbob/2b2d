import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import { checkForFlagCollision } from "./Systems";

export default function addFlag(builder:GameEngineBuilder) {
  builder.systems.update(States.GAME, checkForFlagCollision);
}