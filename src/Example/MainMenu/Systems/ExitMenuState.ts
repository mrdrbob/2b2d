import Update from "../../../2B2D/Update";
import CurtainMovementCompleteSignal from "../../Curtains/Signals/CurtainMovementCompleteSignal";
import ExitMenuSignal from "../Signals/ExitMenuSignal";
import MainMenuState from "../States/MainMenuState";

export default function ExitMenuState(update: Update, signals: CurtainMovementCompleteSignal[]) {
  if (signals.length == 0 || signals[0].sender != 'MainMenu' || signals[0].opened)
    return;

  update.schedule.exit(MainMenuState);
  update.signals.send(ExitMenuSignal);
}