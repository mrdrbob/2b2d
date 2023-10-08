import GameEngineBuilder from "../../Engine/GameEngine";
import States from "../../States";
import { batsFly, detectStomps, spawnEnemies } from "./Systems";

export default function addEnemy(builder:GameEngineBuilder) {
  builder.systems.enter(States.GAME, spawnEnemies);
  builder.systems.update(States.GAME, batsFly);
  builder.systems.update(States.GAME, detectStomps);
}
