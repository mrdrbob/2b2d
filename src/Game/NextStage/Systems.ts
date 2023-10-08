import spawnCurtains from "../../Curtain/SpawnCurtains";
import Update from "../../Engine/Update";
import States from "../../States";
import { GameStateResource } from "../Resources";

export function spawnNextLevelCurtains(update:Update) {
  spawnCurtains(update, (args) => {
    args.update.exitState(States.GAME_TO_NEXT_STAGE);
    args.update.enterState(States.NEXT_STAGE);
    args.update.despawn(args.entity);
  });
}

export function startNextStage(update:Update) {
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  gameState.level += 1;
  if (gameState.level >= 2) {
    update.exitState(States.GAME_TO_NEXT_STAGE);
    update.enterState(States.YOU_WIN);
    return;
  }

  update.exitState(States.GAME_TO_NEXT_STAGE);
  update.enterState(States.GAME);
}