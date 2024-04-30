import Position from "../Components/Position";
import Shaker from "../Components/Shaker";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import getLameNoise from "../Util/LameNoise";

export default function ShakeShakers(update: Update) {
  const query = update.ecs.query(Position, Shaker);

  for (const entity of query) {
    const [pos, shaker] = entity.components;

    if (shaker.timeRemaining <= 0) {
      continue;
    }

    shaker.timeRemaining = Math.max(0, shaker.timeRemaining - update.delta);
    const percent = (shaker.timeRemaining / shaker.shakeTime);
    const period = percent * shaker.speed + shaker.offset;


    const x = getLameNoise(0, period) * shaker.strength * percent;
    const y = getLameNoise(1, period) * shaker.strength * percent;

    pos.position = new Vec2(x, y);
  }
}