import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import { Entity } from "../../../2B2D/Entity";
import MachineState from "../../../2B2D/MachineState";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";

/** Has methods and queries that all the player states use */
export default abstract class BasePlayerState implements MachineState {
  readonly abstract updateImmediately: boolean;
  readonly speed: number = 0.03;
  readonly drag: number = 0.8;


  // Keep re-using this query to get better query caching
  getPlayer(update: Update) {
    const query = update.single([Player.NAME, Velocity.NAME, Animated.NAME, Sprite.NAME, KineticBody.NAME]);
    if (!query)
      return;

    var [player, velocity, animation, sprite, body] = query.components as [Player, Velocity, Animated, Sprite, KineticBody];
    return { entity: query.entity, player, velocity, animation, sprite, body };
  }

  protected abstract onEnter(update: Update, components: { entity: Entity, player: Player, velocity: Velocity, animation: Animated, sprite: Sprite, body: KineticBody }): void;
  protected abstract onUpdate(update: Update, components: { entity: Entity, player: Player, velocity: Velocity, animation: Animated, sprite: Sprite, body: KineticBody }): MachineState | undefined;

  getKeys(update: Update) {
    const keys = update.keys();

    const left = keys.isKeyDown('ArrowLeft');
    const right = keys.isKeyDown('ArrowRight');
    const space = keys.isKeyDown(' ');
    return { left, right, space };
  }

  enter(update: Update): void {
    var player = this.getPlayer(update);
    if (!player)
      return;

    this.onEnter(update, player);
  }


  update(update: Update): MachineState | undefined {
    var player = this.getPlayer(update);
    if (!player)
      return;

    return this.onUpdate(update, player);
  }

  applyLeftAndRightVelocity(update: Update, components: { velocity: Velocity, player: Player, sprite: Sprite }) {
    const { left, right } = this.getKeys(update);

    const { velocity, player, sprite } = components;

    let newVel = velocity.velocity;
    if (player.controlsEnabled && left) {
      newVel = newVel.add(new Vec2(-this.speed, 0));
      player.facing = new Vec2(-1, 0);
      sprite.scale = new Vec2(1, 1);
    }
    if (player.controlsEnabled && right) {
      newVel = newVel.add(new Vec2(this.speed, 0));
      player.facing = new Vec2(1, 0);
      sprite.scale = new Vec2(-1, 1);
    }

    velocity.velocity = newVel.scalarMultiply(this.drag);
  }
}