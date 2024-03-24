import StateMachine from "../../../2B2D/Components/StateMachine";
import Velocity from "../../../2B2D/Components/Velocity";
import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import EnemyCollision from "../../Enemy/Signals/EnemyCollisionSignal";
import Player from "../Components/Player";
import JumpingState from "../Machines/JumpingState";

const BOUNCE_VELOCITY = 0.4;

export default function BounceOnStomps(update: Update, signals: Signal[]) {
  if (signals.length === 0)
    return;

  // This is not great. In general, it is possible to hit multiple enemies at once, 
  // but in the levels I have currently, I don't think it's possible.
  const signal = signals[0] as EnemyCollision;
  if (!signal.isStomp)
    return;

  const query = update.single([Player.NAME, Velocity.NAME, StateMachine.NAME]);
  if (!query)
    return;

  // Cause the player to "hop" a bit.
  const [_player, velocity, state] = query.components as [Player, Velocity, StateMachine];
  velocity.velocity = velocity.velocity.add(new Vec2(0, BOUNCE_VELOCITY));
  state.moveTo(update, JumpingState.Bounce);
}