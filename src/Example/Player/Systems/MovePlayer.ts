import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import Sprite from "../../../2B2D/Components/Sprite";
import Velocity from "../../../2B2D/Components/Velocity";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Player from "../Components/Player";
import { PlayerJumpedSignal } from "../PlayerPlugin";

const speed: number = 0.03;
const drag: number = 0.8;
const jumpSpeed: number = 0.15;
const jumpTime: number = 0.2 * 1000;

export default function MovePlayer(update: Update) {
  const query = update.single([Player.NAME, Velocity.NAME, Animated.NAME, Sprite.NAME, KineticBody.NAME]);
  if (!query)
    return;

  const keys = update.keys();

  const isLeft = keys.isKeyDown('ArrowLeft');
  const isRight = keys.isKeyDown('ArrowRight');
  const isSpace = keys.isKeyDown(' ');
  const delta = update.delta();

  const [player, vel, anim, sprite, body] = query.components as [Player, Velocity, Animated, Sprite, KineticBody];


  let newVel = vel.velocity;
  if (player.controlsEnabled) {
    if (isLeft) {
      newVel = newVel.add(new Vec2(-speed, 0));
      player.facing = new Vec2(-1, 0);
      sprite.scale = new Vec2(1, 1);
    }
    if (isRight) {
      newVel = newVel.add(new Vec2(speed, 0));
      player.facing = new Vec2(1, 0);
      sprite.scale = new Vec2(-1, 1);
    }
    if (isSpace && player.jumpTimeRemaining > 0) {
      newVel = newVel.add(new Vec2(0, jumpSpeed));
      player.jumpTimeRemaining -= delta;
      if (body.isGrounded)
        update.signals.send(PlayerJumpedSignal);
    } else if (body.isGrounded) {
      player.jumpTimeRemaining = jumpTime;
    } else {
      player.jumpTimeRemaining = 0;
    }
  }

  vel.velocity = newVel.scalarMultiply(drag);

  if (player.controlsEnabled && (isLeft || isRight)) {
    anim.tag = body.isGrounded ? 'Walk' : 'Jump';
  } else {
    anim.tag = body.isGrounded ? 'Idle' : 'Jump';
  }
}