import LdktLevelsAsset from "../../../2B2D/Assets/LdktLevelsAsset";
import Timeline from "../../../2B2D/Components/Timeline";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import GameAssets from "../../GameAssets";
import GameStateResource from "../../GameStateResource";
import GameLoopState from "../../States/GameLoopState";
import AllLevelsCompleteSignal from "../Signals/AllLevelsCompleteSignal";
import NextLevelSignal from "../Signals/NextLevelSignal";

function transition(update: Update) {
  const assets = update.assets();
  const gameState = update.resource(GameStateResource);
  const ldtk = assets.assume<LdktLevelsAsset>(GameAssets.ldkt.handle);

  gameState.level += 1;
  if (gameState.level >= ldtk.levels.size) {
    update.signals.send(AllLevelsCompleteSignal);
  } else {
    update.signals.send(NextLevelSignal);
  }
}

export default function TransitionToNextLevel(update: Update) {
  Curtains.Close(update, 'Level');

  update.spawn(
    new Timeline([
      { time: 1000, action: (u) => u.schedule.exit(GameLoopState) },
      { time: 1100, action: transition }
    ])
  );


  const assets = update.assets();

  const gameState = update.resource(GameStateResource);
  const ldtk = assets.assume<LdktLevelsAsset>(GameAssets.ldkt.handle);

}