import Velocity from "../../../2B2D/Components/Velocity";
import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import EnemyCollision from "../../Enemy/Signals/EnemyCollisionSignal";
import Player from "../Components/Player";

const BOUNCE_VELOCITY = 0.4;
const BOUNCE_SECONDS = 0.1;

export default function BounceOnStomps(update: Update, signals: Signal[]) {
  if (signals.length === 0)
    return;

  // This is not great. In general, it is possible to hit multiple enemies at once, 
  // but in the levels I have currently, I don't think it's possible.
  const signal = signals[0] as EnemyCollision;
  if (!signal.isStomp)
    return;

  const query = update.single([Player.NAME, Velocity.NAME]);
  if (!query)
    return;

  // Cause the player to "hop" a bit.
  const [player, velocity] = query.components as [Player, Velocity];
  velocity.velocity = velocity.velocity.add(new Vec2(0, BOUNCE_VELOCITY));
  player.jumpTimeRemaining = BOUNCE_SECONDS * 1000;
}