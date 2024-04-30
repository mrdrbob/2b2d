import MachineState from "../../../2B2D/MachineState";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import PlayerJumpedSignal from "../Signals/PlayerJumpedSignal";
import BasePlayerState from "./BasePlayerState";
import FallingState from "./FallingState";

export default class JumpingState extends BasePlayerState {
  // Jumping state kind of has 2 variations. `Instance` is when the player hits "space",
  // `Bounce` is when the player bounces off an enemy.
  private static readonly Instance = new JumpingState(0.2 * 1000, true);
  private static readonly _Bounce = new JumpingState(0.1 * 1000, false);

  static Jump(current: BasePlayerState) {
    const instance = this.Instance;
    instance.player = current.player;
    instance.delta = current.delta;
    instance.input = current.input;
    return instance;
  }

  static Bounce(current: BasePlayerState) {
    const instance = this._Bounce;
    instance.player = current.player;
    instance.delta = current.delta;
    instance.input = current.input;
    return instance;
  }

  updateImmediately: boolean = true;

  readonly jumpSpeed: number = 0.16 / ((1 / 60) * 1000);

  jumpTimeRemaining = 0;

  private constructor(
    public jumpTime: number,
    public makeSound: boolean
  ) { super(); }

  enter(update: Update): void {
    this.player.animated.tag = 'Jump';

    this.jumpTimeRemaining = this.jumpTime;

    if (this.makeSound)
      update.signals.send(PlayerJumpedSignal);
  }
  protected onUpdate(update: Update): MachineState | undefined {
    this.jumpTimeRemaining -= this.delta;
    if (this.jumpTimeRemaining < 0) {
      return FallingState.Next(this);
    }

    if (!this.player.player.controlsEnabled || !this.input.space) {
      return FallingState.Next(this);
    }

    this.player.velocity.velocity = this.player.velocity.velocity.add(new Vec2(0, this.jumpSpeed * this.delta));
    this.applyLeftAndRightVelocity();
  }

}