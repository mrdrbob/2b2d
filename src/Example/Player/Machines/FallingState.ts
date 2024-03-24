import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import MachineState from "../../../2B2D/MachineState";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";
import BasePlayerState from "./BasePlayerState";
import IdleState from "./IdleState";

/** Player is not grounded, not jumping */
export default class FallingState extends BasePlayerState {
  readonly updateImmediately = false;

  private constructor() { super(); }

  public static readonly Instance = new FallingState();

  protected onEnter(update: Update, components: { entity: number; player: Player; velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): void {
    const { animation } = components;

    animation.tag = 'Jump';
  }

  protected onUpdate(update: Update, components: { entity: number; player: Player; velocity: Velocity; animation: Animated; sprite: Sprite; body: KineticBody; }): MachineState | undefined {
    const { body } = components;

    if (body.isGrounded) {
      return IdleState.Instance;
    }

    this.applyLeftAndRightVelocity(update, components);
  }
}