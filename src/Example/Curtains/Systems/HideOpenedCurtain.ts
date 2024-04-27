import Position from "../../../2B2D/Components/Position";
import Visible from "../../../2B2D/Components/Visibility";
import Update from "../../../2B2D/Update";
import CurtainController from "../Components/CurtainController";
import Curtains from "../Curtains";
import CurtainMovementCompleteSignal from "../Signals/CurtainMovementCompleteSignal";

export default function HideOpenedCurtain(update: Update, signals: CurtainMovementCompleteSignal[]) {
  if (signals.length == 0 || !signals[0].opened)
    return;

  const query = update.ecs.single(CurtainController, Visible, Position);
  if (!query)
    return;

  const [ _, visible, position ] = query.components;

  visible.visible = false;
  position.position = Curtains.Top;
}