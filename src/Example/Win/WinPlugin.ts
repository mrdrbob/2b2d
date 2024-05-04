import Builder from "../../2B2D/Builder";
import Update from "../../2B2D/Update";
import AllLevelsCompleteSignal from "../Level/Signals/AllLevelsCompleteSignal";
import WinCleanup from "./Components/WinCleanup";
import WinState from "./States/WinState";
import SpawnWinScreen from "./Systems/SpawnWinScreen";

export default function WinPlugin(builder: Builder) {
  builder.signals.handle(AllLevelsCompleteSignal, (update: Update) => {
    update.schedule.enter(WinState);
  })

  builder.schedule.enter(WinState, SpawnWinScreen);

  builder.schedule.cleanup(WinState, WinCleanup);
}