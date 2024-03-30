import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import MappedInput from "../../../2B2D/Components/MappedInput";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import MachineState from "../../../2B2D/MachineState";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";
import BasePlayerState from "./BasePlayerState";
import FallingState from "./FallingState";
import JumpingState from "./JumpingState";
import WalkingState from "./WalkingState";

/** Player is grounded, but not moving */
export default class IdleState extends BasePlayerState {
  readonly updateImmediately = true;

  private constructor() { super(); }

  public static readonly Instance = new IdleState();

  protected onEnter(update: Update, components: { entity: number; player: Player; velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): void {
    const { animation } = components;
    animation.tag = 'Idle';
  }

  protected onUpdate(update: Update, components: { entity: number; player: Player; input: MappedInput, velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): MachineState | undefined {
    const { body } = components;

    if (!body.isGrounded) {
      return FallingState.Instance;
    }

    var { left, right, space } = this.getKeys(update, components);
    if (left || right) {
      return WalkingState.Instance;
    }
    if (space) {
      return JumpingState.Instance;
    }

    this.applyLeftAndRightVelocity(update, components);
  }
}