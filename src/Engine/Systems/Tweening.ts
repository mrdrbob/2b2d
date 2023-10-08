import Tween from "../Components/Tween";
import Update from "../Update";

export default function updateTweens(update: Update) {
  const query = update.queryCached('updateTweens', [Tween.NAME]);

  for (const entity of query) {
    const [tween] = entity.components as [Tween];

    if (!tween.active)
      continue;

    if (tween.time > tween.totalTime) {
      tween.onUpdate(1);
      tween.active = false;
      if (tween.onComplete)
      tween.onComplete({ update, entity: entity.entity, component: tween });
      continue;
    } else {
      tween.time += update.deltaTime();
    }

    const percent = tween.time / tween.totalTime;
    tween.onUpdate(percent);
  }
}