import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import LoadedSignal from "../Signals/LoadedSignal";
import InitState from "../States/InitState";

export default function AwaitLoaded(update: Update) {
  const loaded = GameAssets.isLoaded(update.assets());
  if (loaded) {
    update.schedule.exit(InitState);
    update.signals.send(LoadedSignal);
  }
}