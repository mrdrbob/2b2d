import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import addDied from "./Died/DiedPlugin";
import addEnemy from "./Enemy/EnemyPlugin";
import addFlag from "./Flag/FlagPlugin";
import addLevel from "./Level/LevelPlugin";
import addNextStage from "./NextStage/NextStagePlugin";
import addPlayer from "./Player/PlayerPlugin";
import { GameStateResource } from "./Resources";
import { cleanUpLevel, closeCurtains, PlayerDiedEvent, PlayerEnemyCollisionEvent, playerInteractWithEnemies } from "./Systems";
import addWater from "./Water/WaterPlugin";
import addYouWinScreen from "./Win/WinPlugin";

// Plugin
export default function addGamePlay(builder:GameEngineBuilder) {
  builder.resources.addResource(new GameStateResource());
  builder.events.register<PlayerEnemyCollisionEvent>(PlayerEnemyCollisionEvent.NAME);
  builder.events.register<PlayerDiedEvent>(PlayerDiedEvent.NAME);

  addLevel(builder);
  addPlayer(builder);
  addEnemy(builder);
  addDied(builder);
  addWater(builder);
  addFlag(builder);
  addNextStage(builder);
  addYouWinScreen(builder);
  
  builder.systems.enter(States.GAME, closeCurtains);
  builder.systems.update(States.GAME, playerInteractWithEnemies);
  
  // Clean up levels
  builder.systems.exit(States.GAME_TO_DIED, cleanUpLevel);
  builder.systems.exit(States.GAME_TO_NEXT_STAGE, cleanUpLevel);
}