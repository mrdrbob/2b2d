import StateMachine from "../../../2B2D/Components/StateMachine";
import Velocity from "../../../2B2D/Components/Velocity";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";
import BasePlayerState from "../MachineStates/BasePlayerState";
import JumpingState from "../MachineStates/JumpingState";

const BOUNCE_VELOCITY = new Vec2(0, 0.4);

export default function HandleStomp(update: Update) {
  const query = update.ecs.single(Player, StateMachine, Velocity);
  if (!query)
    return;

  const [_p, state, velocity] = query.components;

  const newState = JumpingState.Bounce(state.state as BasePlayerState);
  newState.prep(update);
  velocity.velocity = velocity.velocity.add(BOUNCE_VELOCITY);
  state.moveTo(update, newState);
}