import SpriteTween from "../../2B2D/Components/SpriteTween";
import Visible from "../../2B2D/Components/Visibility";
import Vec2 from "../../2B2D/Math/Vec2";
import Update from "../../2B2D/Update";
import Depths from "../Depths";
import CurtainController from "./Components/CurtainController";
import CurtainMovementCompleteSignal from "./Signals/CurtainMovementCompleteSignal";

export default class Curtains {
  static readonly Top = Vec2.from(0, 300);
  static readonly Center = Vec2.from(0, 0);
  static readonly Bottom = Vec2.from(0, -300);

  static Open(update: Update, sender: string) {
    const query = update.ecs.single(CurtainController);
    if (!query)
      return;

    const chain = SpriteTween.build()
      .andThen(1000, s => s.pos(this.Bottom))
      .entity(query.entity)
      .signal(new CurtainMovementCompleteSignal(sender, true))
      .chain();

    update.spawn(chain);
  }

  static Close(update: Update, sender: string) {
    const query = update.ecs.single(CurtainController);
    if (!query)
      return;

    const visible = update.ecs.get(query.entity, Visible);
    if (visible) {
      visible.visible = true;
    }

    const chain = SpriteTween.build()
      .andThen(1000, s => s.pos(this.Center))
      .entity(query.entity)
      .signal(new CurtainMovementCompleteSignal(sender, false))
      .chain();
    update.spawn(chain);
  }
}