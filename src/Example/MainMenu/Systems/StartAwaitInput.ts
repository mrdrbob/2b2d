import Update from "../../../2B2D/Update";
import CurtainMovementCompleteSignal from "../../Curtains/Signals/CurtainMovementCompleteSignal";
import WaitForInputState from "../States/WaitForInputState";

export default function StartAwaitInput(update: Update, signals: CurtainMovementCompleteSignal[]) {
  if (signals.length == 0 || signals[0].sender != 'MainMenu' || !signals[0].opened)
    return;

  update.schedule.enter(WaitForInputState);
}