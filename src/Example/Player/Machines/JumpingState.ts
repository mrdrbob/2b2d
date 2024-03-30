import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import MappedInput from "../../../2B2D/Components/MappedInput";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import MachineState from "../../../2B2D/MachineState";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";
import { PlayerJumpedSignal } from "../PlayerPlugin";
import BasePlayerState from "./BasePlayerState";
import FallingState from "./FallingState";

/** Player is in the air, accelerating upwards as long as jump time remains and space is held down. */
export default class JumpingState extends BasePlayerState {
  readonly updateImmediately = true;

  private constructor(public jumpTime: number, public makeSound: boolean) { super(); }

  // Jumping state kind of has 2 variations. `Instance` is when the player hits "space",
  // `Bounce` is when the player bounces off an enemy.
  public static readonly Instance = new JumpingState(0.2 * 1000, true);
  public static readonly Bounce = new JumpingState(0.1 * 1000, false);

  readonly jumpSpeed: number = 0.15;

  jumpTimeRemaining = 0;

  protected onEnter(update: Update, components: { entity: number; player: Player; velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): void {
    const { animation } = components;

    animation.tag = 'Jump';

    this.jumpTimeRemaining = this.jumpTime;

    if (this.makeSound)
      update.signals.send(PlayerJumpedSignal);
  }

  protected onUpdate(update: Update, components: { entity: number; player: Player; input: MappedInput, velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): MachineState | undefined {
    const { player, velocity } = components;
    this.jumpTimeRemaining -= update.delta();
    if (this.jumpTimeRemaining < 0) {
      return FallingState.Instance;
    }

    const { space } = this.getKeys(update, components);
    if (!player.controlsEnabled || !space) {
      return FallingState.Instance;
    }

    velocity.velocity = velocity.velocity.add(new Vec2(0, this.jumpSpeed));
    this.applyLeftAndRightVelocity(update, components);
  }
}
