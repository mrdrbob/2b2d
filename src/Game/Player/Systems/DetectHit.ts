import Assets from "../../../Assets";
import Position from "../../../Engine/Components/Position";
import Velocity from "../../../Engine/Components/Velocity";
import Vec2 from "../../../Engine/Math/Vec2";
import AudioServerResource from "../../../Engine/Resources/AudioServerResource";
import Update from "../../../Engine/Update";
import { GameStateResource } from "../../Resources";
import { PlayerDiedEvent, PlayerEnemyCollisionEvent } from "../../Systems";
import { Player } from "../Components";

const BOUNCE_VELOCITY = 7;

export default function detectEnemyHit(update:Update) {
  const event = update.event<PlayerEnemyCollisionEvent>(PlayerEnemyCollisionEvent.NAME);

  const events = event.read();
  if (events.length == 0)
    return;

  const query = update.queryCached('detectEnemyHit:player', [ Player.NAME, Velocity.NAME, Position.NAME ]);
  if (query.length == 0)
    return;
  
  const [ player, velocity, position ]  = query[0].components as [ Player, Velocity, Position ];

  // If we stomp them, great! Bounce!
  const first = events[0];
  if (first.fromAbove) {
    // Bounce!
    velocity.velocity = new Vec2(velocity.velocity.x, BOUNCE_VELOCITY);
    player.jumpTimeRemaining = 0.1 * 1000;
    return;
  }

  // Otherwise, we don't care about hits when the player is invincible
  if (player.invincibleTimeRemaining > 0)
    return;
  const state = update.resource<GameStateResource>(GameStateResource.NAME);
  state.health -= first.damage;

  const audio = update.resource<AudioServerResource>(AudioServerResource.NAME);
  if (state.health <= 0) {
    const diedEvent = update.event<PlayerDiedEvent>(PlayerDiedEvent.NAME);
    diedEvent.push({ playerPosition: position.globalPosition() });
    update.despawn(query[0].entity);
    return;
  }

  audio.play(Assets.SOUND.HURT);
  player.invincibleTimeRemaining = 2000;
}