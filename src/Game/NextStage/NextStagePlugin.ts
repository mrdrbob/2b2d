import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import { spawnNextLevelCurtains, startNextStage } from "./Systems";

export default function addNextStage(builder:GameEngineBuilder) {
  builder.systems.enter(States.GAME_TO_NEXT_STAGE, spawnNextLevelCurtains);
  builder.systems.enter(States.NEXT_STAGE, startNextStage);
}


