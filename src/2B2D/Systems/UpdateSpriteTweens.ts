import SpriteTween, { SpriteTweenComponent } from "../Components/SpriteTween";
import Position, { PositionComponent } from "../Components/Position";
import Sprite, { SpriteComponent } from "../Components/Sprite";
import Timer, { TimerComponent } from "../Components/Timer";
import Update from "../Update";

export default function UpdateSpriteTweens(update:Update) {
  const query = update.query([ SpriteTween.name, Timer.name ]);

  for (const entity of query) {
    const [ tween, timer ] = entity.components as [ SpriteTweenComponent, TimerComponent ];

    let entityId = entity.entity;
    if (tween.entity !== undefined) {
      const resolved = update.resolveEntity(tween.entity);
      if (!resolved)
        continue;
      entityId = resolved;
    }

    const sprite = update.get<SpriteComponent>(entityId, Sprite.name);
    const position = update.get<PositionComponent>(entityId, Position.name);

    if (!sprite || !position)
      continue;

    const progress = timer.currentTime / timer.totalTime;

    const posDelta = tween.endPos.sub(tween.startPos);
    const currentPos = tween.startPos.add( posDelta.scalarMultiply(progress) );
    position.pos = currentPos;

    const colorDelta = tween.endColor.sub(tween.startColor);
    const currentColor = tween.startColor.add(colorDelta.scalarMultiply(progress));
    sprite.color = currentColor;
  }
}