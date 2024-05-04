import MappedInput from "../../../2B2D/Components/MappedInput";
import Velocity from "../../../2B2D/Components/Velocity";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import PlayerActions from "../../PlayerActions";
import Player from "../Components/Player";

export default function MovePlayer(update: Update) {
  const controller = update.ecs.single(MappedInput);
  if (!controller)
    return;

  const query = update.ecs.single(Player, Velocity);
  if (!query)
    return;

  const [_p, velocity] = query.components;

  const [input] = controller.components;
  const left = input.isPressed(update, PlayerActions.left);
  const right = input.isPressed(update, PlayerActions.right);

  if (left) {
    velocity.velocity = velocity.velocity.add(new Vec2(-0.01, 0));
  }
  if (right) {
    velocity.velocity = velocity.velocity.add(new Vec2(0.01, 0));
  }
  velocity.velocity = velocity.velocity.scalarMultiply(0.9);
}