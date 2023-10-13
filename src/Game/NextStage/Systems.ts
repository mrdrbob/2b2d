import Assets from "../../Assets";
import spawnCurtains from "../../Curtain/SpawnCurtains";
import LdtkData from "../../Engine/Assets/Ldtk";
import AssetsResource from "../../Engine/Resources/AssetsResource";
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
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  
  const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);

  gameState.level += 1;
  if (gameState.level >= ldtk.levels.length) {
    update.exitState(States.GAME_TO_NEXT_STAGE);
    update.enterState(States.YOU_WIN);
    return;
  }

  update.exitState(States.GAME_TO_NEXT_STAGE);
  update.enterState(States.GAME);
}