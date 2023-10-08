import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import { checkForWaterCollision } from "./Systems";

export default function addWater(builder:GameEngineBuilder) {
  builder.systems.update(States.GAME, checkForWaterCollision);
}