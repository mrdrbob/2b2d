import Assets from "../../../Assets";
import Animated from "../../../Engine/Components/Animated";
import KineticBody from "../../../Engine/Components/KineticBody";
import Sprite from "../../../Engine/Components/Sprite";
import Velocity from "../../../Engine/Components/Velocity";
import Vec2 from "../../../Engine/Math/Vec2";
import AudioServerResource from "../../../Engine/Resources/AudioServerResource";
import KeysResource from "../../../Engine/Resources/KeysResource";
import Update from "../../../Engine/Update";
import { Player } from "../Components";

const speed:number = 0.03;
const drag:number = 0.8;
const jumpSpeed:number = 0.15;
const jumpTime:number = 0.2 * 1000;

export default function movePlayer(update:Update) {
  const query = update.queryCached('movePlayer', [Player.NAME, Velocity.NAME, Animated.NAME, Sprite.NAME, KineticBody.NAME]);
  const keys = update.resource<KeysResource>(KeysResource.NAME);
  const sound = update.resource<AudioServerResource>(AudioServerResource.NAME);

  const isLeft = keys.isKeyDown('ArrowLeft');
  const isRight = keys.isKeyDown('ArrowRight');
  const isSpace = keys.isKeyDown(' ');
  const deltaTime = update.deltaTime();

  for (const entity of query) {
    const [ player, vel, anim, sprite, body ] = entity.components as [Player, Velocity, Animated, Sprite, KineticBody];


    let newVel = vel.velocity;
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
      player.jumpTimeRemaining -= deltaTime;
      if (body.isGrounded) {
        sound.play(Assets.SOUND.JUMP, 0.1);
      }
    } else if (body.isGrounded) {
      player.jumpTimeRemaining = jumpTime;
    } else {
      player.jumpTimeRemaining = 0;
    }

    vel.velocity = newVel.scalarMultiply(drag);

    if (isLeft || isRight) {
      anim.tag = body.isGrounded ? 'Walk' : 'Jump';
    } else {
      anim.tag = body.isGrounded ? 'Idle' : 'Jump';
    }

    //if (keys.keyJustReleased('q')) {
    //  player.invincibleTimeRemaining = 2000;
    //}

    // pos.pos = pos.pos.add(vel.velocity.scalarMultiply(update.deltaTime()));
  }
}
