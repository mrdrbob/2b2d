import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import MappedInput from "../../../2B2D/Components/MappedInput";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import MachineState from "../../../2B2D/MachineState";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import PlayerActions from "../../PlayerActions";
import Player from "../Components/Player";

/** Has methods and queries that all the player states use */
export default abstract class BasePlayerState implements MachineState {
  readonly abstract updateImmediately: boolean;

  readonly speed: number = 0.03 / ((1 / 60) * 1000);
  readonly drag: number = 0.8;
  player!: { player: Player; velocity: Velocity; animated: Animated; sprite: Sprite; body: KineticBody; };
  input!: { left: boolean; right: boolean; space: boolean; };
  delta: number = 0;


  abstract enter(update: Update): void;

  prep(update: Update) {
    this.delta = update.delta;
    
    const player = update.ecs.single(Player, Velocity, Animated, Sprite, KineticBody);
    const input = update.ecs.single(MappedInput);
    if (!player || !input)
      return;

    const [ _player, velocity, animated, sprite, body ] = player.components;
    this.player = {  player: _player, velocity, animated, sprite, body };

    const [ mapped ] = input.components;

    const left = mapped.isPressed(update, PlayerActions.left);
    const right = mapped.isPressed(update, PlayerActions.right);
    const space = mapped.isPressed(update, PlayerActions.jump);
    
    this.input = { left, right, space };
  }

  update(update: Update): MachineState | undefined {
    this.prep(update);

    return this.onUpdate(update);
  }

  protected abstract onUpdate(update: Update) : MachineState | undefined;

  applyLeftAndRightVelocity() {
    let newVel = this.player.velocity.velocity;
    if (this.player.player.controlsEnabled && this.input.left) {
      newVel = newVel.add(new Vec2(-this.speed * this.delta, 0));
      this.player.player.facing = new Vec2(-1, 0);
      this.player.sprite.scale = new Vec2(1, 1);
    }
    if (this.player.player.controlsEnabled && this.input.right) {
      newVel = newVel.add(new Vec2(this.speed * this.delta, 0));
      this.player.player.facing = new Vec2(1, 0);
      this.player.sprite.scale = new Vec2(-1, 1);
    }

    this.player.velocity.velocity = newVel.scalarMultiply(this.drag);
  }
}