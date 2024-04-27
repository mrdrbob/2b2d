import MachineState from "../../../2B2D/MachineState";
import Update from "../../../2B2D/Update";
import BasePlayerState from "./BasePlayerState";
import IdleState from "./IdleState";

export default class FallingState extends BasePlayerState {
  private static readonly Instance = new FallingState();

  static Next(current:BasePlayerState) {
    const instance = this.Instance;
    instance.player = current.player;
    instance.delta = current.delta;
    instance.input = current.input;
    return instance;
  }

  updateImmediately = true;

  private constructor() { super(); }

  enter(update: Update): void {
    this.player.animated.tag = 'Jump';
  }
  protected onUpdate(update: Update): MachineState | undefined {
    if (this.player.body.isGrounded) {
      return IdleState.Next(this);
    }

    this.applyLeftAndRightVelocity();
  }

}