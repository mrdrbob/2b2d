import MachineState from "../../../2B2D/MachineState";
import Update from "../../../2B2D/Update";
import BasePlayerState from "./BasePlayerState";
import FallingState from "./FallingState";
import IdleState from "./IdleState";
import JumpingState from "./JumpingState";

export default class WalkingState extends BasePlayerState {
  private static readonly Instance = new WalkingState();

  static Next(current: BasePlayerState) {
    const instance = this.Instance;
    instance.player = current.player;
    instance.delta = current.delta;
    instance.input = current.input;
    return instance;
  }

  updateImmediately: boolean = true;

  private constructor() { super(); }

  enter(update: Update): void {
    this.player.animated.tag = 'Walk';
  }
  protected onUpdate(update: Update): MachineState | undefined {
    if (!this.player.body.isGrounded) {
      return FallingState.Next(this);
    }

    if (this.player.player.controlsEnabled && this.input.space) {
      return JumpingState.Jump(this);
    }

    if (!this.player.player.controlsEnabled || (!this.input.left && !this.input.right)) {
      return IdleState.Next(this);
    }

    this.applyLeftAndRightVelocity();
  }

}